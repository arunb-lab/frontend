import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { showErrorToast } from "../utils/toast";
import OpenStreetMap from "../Components/OpenStreetMap";
import { MapPin, Search, Heart, Stethoscope, Calendar, Clock, Users, Star, Phone, Mail } from "lucide-react";

const SPECIALIZATION_OPTIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Orthopedic",
  "Gynecologist",
  "Neurologist",
  "Psychiatrist",
  "Dentist",
];

const EXPERIENCE_OPTIONS = ["Any", "1+ years", "3+ years", "5+ years", "10+ years"];

const RATING_OPTIONS = ["Any", "3+ ⭐", "4+ ⭐", "4.5+ ⭐"];

const SearchDoctors = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const specFromUrl = searchParams.get("spec") || "";

  // Results
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);

  // Check if this is a department-based search
  const isDepartmentSearch = specFromUrl !== "";

  // Location and Map
  const [userLocation, setUserLocation] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [useLocation, setUseLocation] = useState(false);

  // Basic search
  const [doctorName, setDoctorName] = useState("");
  const [specialization, setSpecialization] = useState("");
  console.log('Current specialization state:', specialization); // Debug log
  const [specializations, setSpecializations] = useState([]);
  const [hospitalClinic, setHospitalClinic] = useState("");
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");

  // Filters
  const [availability, setAvailability] = useState(""); // today, tomorrow, week
  const [timeOfDay, setTimeOfDay] = useState(""); // morning, evening
  const [consultationType, setConsultationType] = useState(""); // physical, online
  const [minFee, setMinFee] = useState("");
  const [maxFee, setMaxFee] = useState("");
  const [gender, setGender] = useState("");

  // Advanced
  const [experience, setExperience] = useState("Any");
  const [rating, setRating] = useState("Any");
  const [language, setLanguage] = useState("");

  useEffect(() => {
    fetchSpecializations();
    // Only fetch doctors if there's a specialization from URL (department search)
    if (specFromUrl) {
      setSpecialization(specFromUrl);
      fetchDoctors(specFromUrl); // Pass the value directly to avoid stale state bug
    }
  }, [specFromUrl]);

  // Fetch doctors when specialization changes
  useEffect(() => {
    if (specialization) {
      console.log('Specialization changed, fetching doctors:', specialization);
      fetchDoctors(specialization);
    } else {
      // If specialization is cleared, fetch all doctors
      fetchDoctors("");
    }
  }, [specialization]);

  // Create a separate function for category search
  const handleCategoryClick = async (categoryName) => {
    try {
      console.log('=== CATEGORY CLICKED ===');
      console.log('Category clicked:', categoryName);
      setSpecialization(categoryName);
      // fetchDoctors will be triggered by the useEffect above
    } catch (error) {
      console.error('=== ERROR IN CATEGORY CLICK ===');
      console.error('Error details:', error);
      showErrorToast("Failed to fetch doctors");
    }
  };

  const handleClearFilters = () => {
    setSpecialization("");
    setDoctorName("");
    setHospitalClinic("");
    setCity("");
    setArea("");
    setUseLocation(false);
    setUserLocation(null);
    setShowMap(false);
    // Remove query param from URL
    navigate("/search-doctors", { replace: true });
  };

  const fetchSpecializations = async () => {
    try {
      const res = await axios.get("http://localhost:3000/doctors/search");
      const uniqueSpecs = [
        ...new Set(res.data.doctors.map((d) => d.specialization).filter(Boolean)),
      ];
      const combined = Array.from(
        new Set([...SPECIALIZATION_OPTIONS, ...uniqueSpecs])
      );
      setSpecializations(combined.sort());
    } catch (err) {
      console.error("Error fetching specializations:", err);
    }
  };

  const fetchDoctors = async (specificSpecialization = null) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      // Use the provided override or the current state
      const finalSpec = (specificSpecialization !== null) ? specificSpecialization : specialization;
      
      console.log('Fetching doctors with specialization:', finalSpec); // Debug log

      // Basic
      if (doctorName) params.append("name", doctorName.trim());
      if (finalSpec) params.append("specialization", finalSpec);
      if (hospitalClinic) params.append("hospital", hospitalClinic.trim());
      if (city) params.append("city", city.trim());
      if (area) params.append("area", area.trim());

      // Location-based search
      if (useLocation && userLocation) {
        params.append("lat", userLocation.lat);
        params.append("lng", userLocation.lng);
        params.append("maxDistance", "25"); // Default 25km radius
      }

      // Filters
      if (availability) params.append("availability", availability);
      if (timeOfDay) params.append("timeOfDay", timeOfDay);
      if (consultationType) params.append("consultationType", consultationType);
      if (minFee) params.append("minFee", minFee);
      if (maxFee) params.append("maxFee", maxFee);
      if (gender) params.append("gender", gender);

      // Advanced
      if (experience && experience !== "Any") {
        const expYears = parseInt(experience.split("+")[0]);
        params.append("experience", expYears);
      }
      if (rating && rating !== "Any") {
        const minRating = parseFloat(rating.split("+")[0]);
        params.append("minRating", minRating);
      }
      if (language) params.append("language", language.trim());

      const res = await axios.get(`http://localhost:3000/doctors/search?${params}`);
      const doctorsData = res.data.doctors || [];
      console.log('Doctors data:', doctorsData[0]); // Debug log
      setDoctors(doctorsData);
    } catch (err) {
      console.error("Error fetching doctors:", err);
      showErrorToast("Failed to fetch doctors. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleLocationToggle = async () => {
    if (!useLocation) {
      try {
        const position = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 300000,
          });
        });

        const location = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserLocation(location);
        setUseLocation(true);
        setShowMap(true);
      } catch (err) {
        console.error("Location error:", err);
        showErrorToast("Failed to get location. Please enable location services.");
      }
    } else {
      setUseLocation(false);
      setUserLocation(null);
      setShowMap(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 relative overflow-hidden">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-4000"></div>
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-blue-100 rounded-full opacity-20"></div>
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-indigo-100 rounded-full opacity-20"></div>
      </div>

      {/* Hero Section - Only shown when no specialization is selected */}
      {!specialization && (
        <div className="relative z-10 px-4 py-16 lg:py-16">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-800 mb-6 leading-tight">
                Quick, Easy, Reliable Healthcare
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Connect with qualified healthcare professionals instantly. Book appointments, get consultations, and manage your health journey.
              </p>
            </div>

            {/* Search Bar */}
            <div className="max-w-4xl mx-auto mb-10">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-6 border border-white/20">
                <form onSubmit={handleSearch} className="flex flex-col lg:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search by specialty or doctor"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white/50 backdrop-blur-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl font-semibold"
                  >
                    Search
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Department Header - shown when specialization is active */}
      {specialization && (
        <div className="relative z-10 pt-10 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-800 mb-2">
                  {specialization}s
                </h1>
                <p className="text-lg text-gray-600">
                  Qualified specialists available for your healthcare needs
                </p>
              </div>
              <button 
                onClick={handleClearFilters}
                className="bg-white border border-gray-200 px-6 py-2 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors shadow-sm font-medium flex items-center gap-2"
              >
                <Search className="w-4 h-4" />
                Change Search
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="relative z-10 pb-20">
        <div className="max-w-7xl mx-auto px-4">
          {/* Search Results */}
          {!loading && doctors.length > 0 && (
            <div className="max-w-6xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">
                  {specialization 
                    ? `${doctors.length} Specialist${doctors.length !== 1 ? 's' : ''} Found`
                    : `${doctors.length} Doctor${doctors.length !== 1 ? 's' : ''} Found`
                  }
                </h2>
                
                {/* Doctor List */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {doctors.map((doctor) => (
                    <div key={doctor.id} className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-white font-bold text-lg">
                            {doctor.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-800">{doctor.name}</h3>
                          <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                          <p className="text-gray-600 text-sm mt-1">{doctor.clinic?.name}</p>
                          <p className="text-gray-500 text-sm">{doctor.clinic?.address}</p>
                          
                          <div className="flex items-center gap-4 mt-3">
                            {doctor.consultationFee && doctor.consultationFee > 0 ? (
                              <span className="text-green-600 font-semibold">
                                Rs. {doctor.consultationFee}
                              </span>
                            ) : (
                              <span className="text-gray-500 text-sm">
                                Fee not available
                              </span>
                            )}
                            {doctor.averageRating > 0 && (
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                                <span className="text-sm text-gray-600">{doctor.averageRating}</span>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2 mt-4">
                            <button
                              onClick={() => navigate(`/book-appointment/${doctor.id}`)}
                              className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 text-sm font-semibold"
                            >
                              Book
                            </button>
                            <button
                              onClick={() => navigate(`/doctor-details/${doctor.id}`)}
                              className="flex-1 bg-gray-100 text-gray-700 py-2 rounded-lg hover:bg-gray-200 transition-all duration-300 text-sm font-semibold"
                            >
                              Details
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {loading && (
            <div className="max-w-6xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Searching for doctors...</p>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && doctors.length === 0 && (
            <div className="max-w-6xl mx-auto mb-12">
              <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 shadow-lg border border-white/20 text-center">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {isDepartmentSearch ? 'No doctors found in this specialization' : 'No doctors found'}
                </h3>
                <p className="text-gray-600">
                  {isDepartmentSearch 
                    ? 'There are no doctors available in this specialization at the moment.'
                    : 'Try adjusting your search criteria or filters.'
                  }
                </p>
              </div>
            </div>
          )}

          {/* Category Buttons - Hidden when specialization is set */}
          {!specialization && (
            <div className="max-w-6xl mx-auto mb-16">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
                {[
                  { name: "Cardiologist", icon: Heart, color: "from-red-400 to-pink-500" },
                  { name: "Neurologist", icon: Stethoscope, color: "from-purple-400 to-indigo-500" },
                  { name: "Pediatrics", icon: Users, color: "from-green-400 to-teal-500" },
                  { name: "Orthopedics", icon: Calendar, color: "from-blue-400 to-cyan-500" },
                  { name: "Dermatology", icon: Star, color: "from-yellow-400 to-orange-500" },
                  { name: "Dentist", icon: Heart, color: "from-cyan-400 to-blue-500" },
                  { name: "Psychiatrist", icon: Stethoscope, color: "from-indigo-400 to-purple-500" },
                  { name: "General Practice", icon: Users, color: "from-gray-400 to-gray-500" }
                ].map((category, index) => (
                  <button
                    key={index}
                    onClick={() => handleCategoryClick(category.name)}
                    className={`bg-gradient-to-r ${category.color} p-4 rounded-xl hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 group`}
                  >
                    <category.icon className="w-6 h-6 text-white mx-auto mb-2" />
                    <span className="text-white text-xs font-medium">{category.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats - Bottom Features */}
          <div className="grid lg:grid-cols-2 gap-8 mb-16">
            {/* Quick Stats Grid can be added here if needed */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchDoctors;
