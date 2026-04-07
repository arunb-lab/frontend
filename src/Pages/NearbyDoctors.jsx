import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import OpenStreetMap from '../Components/OpenStreetMap';
import { 
  MapPin, 
  Search, 
  Filter, 
  Loader2, 
  AlertCircle,
  Clock,
  Phone,
  DollarSign,
  Star
} from 'lucide-react';

const NearbyDoctors = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState([]);
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(300); // km - covers entire Nepal
  const [selectedSpecialization, setSelectedSpecialization] = useState('');
  const [sortBy, setSortBy] = useState('distance'); // distance, rating, fee
  const [showMap, setShowMap] = useState(true);

  const API_BASE = 'http://localhost:3000/doctors';
  const specializations = [
    'General Practice',
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Gynecology',
    'Psychiatry',
    'Ophthalmology',
    'ENT',
    'Dentistry',
    'Internal Medicine'
  ];

  useEffect(() => {
    fetchNearbyDoctors();
  }, [searchRadius, selectedSpecialization]);

  useEffect(() => {
    sortDoctors();
  }, [sortBy, doctors]);

  const sortDoctors = () => {
    let sorted = [...doctors];
    
    switch (sortBy) {
      case 'distance':
        sorted.sort((a, b) => (a.distance || 0) - (b.distance || 0));
        break;
      case 'rating':
        sorted.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
        break;
      case 'fee':
        sorted.sort((a, b) => (a.consultationFee || 0) - (b.consultationFee || 0));
        break;
      default:
        break;
    }
    
    setFilteredDoctors(sorted);
  };

  const handleDoctorSelect = (doctorId, directBooking = false) => {
    const id = typeof doctorId === 'object' ? (doctorId.id || doctorId._id) : doctorId;
    
    if (directBooking) {
      navigate(`/book-appointment/${id}`);
    } else {
      // For now, details just leads to booking as well, but we use the correct route param
      navigate(`/book-appointment/${id}`);
    }
  };

  const handleLocationRefresh = () => {
    fetchNearbyDoctors();
  };

  const fetchNearbyDoctors = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Get user location using native browser geolocation
      const location = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          // Fallback to central Nepal coordinates (covers Biratnagar and Kathmandu)
          resolve({
            lat: 26.5, // Central Nepal latitude
            lng: 87.0  // Central Nepal longitude
          });
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
          },
          (error) => {
            // Fallback to central Nepal coordinates if user denies location
            console.warn('Location access denied, using central Nepal location');
            resolve({
              lat: 26.5, // Central Nepal latitude
              lng: 87.0  // Central Nepal longitude
            });
          },
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000 // 5 minutes
          }
        );
      });
      
      setUserLocation(location);
      
      // Fetch nearby doctors from API
      const params = new URLSearchParams({
        lat: location.lat,
        lng: location.lng,
        maxDistance: searchRadius
      });
      
      if (selectedSpecialization) {
        params.append('specialization', selectedSpecialization);
      }

      const response = await axios.get(`${API_BASE}/nearby?${params}`);
      const doctorsData = response.data.doctors || [];
      
      // Set doctors directly without travel info
      setDoctors(doctorsData);
      setFilteredDoctors(doctorsData);
      
    } catch (err) {
      console.error('Error fetching nearby doctors:', err);
      if (err.code === 1) {
        setError('Location access denied. Please enable location services to find nearby doctors.');
      } else {
        setError('Failed to find nearby doctors. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
              <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Location Error</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={handleLocationRefresh}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">Nearby Doctors</h1>
              <p className="text-gray-600">
                Find doctors near your location ({searchRadius} km radius)
              </p>
            </div>
            <button
              onClick={handleLocationRefresh}
              className="mt-4 md:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              Refresh Location
            </button>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search Radius
              </label>
              <select
                value={searchRadius}
                onChange={(e) => setSearchRadius(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value={5}>5 km</option>
                <option value={10}>10 km</option>
                <option value={15}>15 km</option>
                <option value={25}>25 km</option>
                <option value={50}>50 km</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Specialization
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="distance">Distance</option>
                <option value="rating">Rating</option>
                <option value="fee">Consultation Fee</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={() => setShowMap(!showMap)}
                className="w-full bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center gap-2"
              >
                {showMap ? 'Hide Map' : 'Show Map'}
              </button>
            </div>
          </div>
        </div>

        {/* Map and Results */}
        <div className={`grid ${showMap ? 'lg:grid-cols-2' : 'lg:grid-cols-1'} gap-6`}>
          {/* Map */}
          {showMap && (
            <div className="lg:sticky lg:top-6 lg:h-[600px]">
              <OpenStreetMap
                doctors={filteredDoctors}
                center={userLocation}
                searchRadius={searchRadius}
                onDoctorSelect={handleDoctorSelect}
                height="600px"
              />
            </div>
          )}

          {/* Doctor List */}
          <div>
            <div className="bg-white rounded-xl shadow-lg p-6 mb-4">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                {filteredDoctors.length} Doctors Found
              </h2>
            </div>

            {filteredDoctors.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-800 mb-2">No Doctors Found</h3>
                <p className="text-gray-600">
                  Try increasing the search radius or selecting a different specialization.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDoctors.map((doctor) => (
                  <div key={doctor.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between">
                      <div className="flex-1">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-blue-600 font-bold text-lg">
                              {doctor.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-800 mb-1">
                              Dr. {doctor.name}
                            </h3>
                            <p className="text-blue-600 font-medium mb-2">{doctor.specialization}</p>
                            
                            <div className="space-y-2 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{doctor.clinic?.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                <span>{doctor.clinic?.address}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                <span>{doctor.phone || 'Not available'}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <DollarSign className="w-4 h-4" />
                                <span>Rs. {doctor.consultationFee}</span>
                              </div>
                            </div>

                            <div className="flex items-center gap-4 mt-3">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm font-medium">
                                  {doctor.averageRating || 'N/A'}
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({doctor.totalReviews || 0} reviews)
                                </span>
                              </div>
                              <div className="text-sm text-blue-600 font-medium">
                                {doctor.distance} km away
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 md:mt-0 md:ml-4">
                        <button
                          onClick={() => handleDoctorSelect(doctor.id)}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full md:w-auto"
                        >
                          Book Appointment
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NearbyDoctors;
