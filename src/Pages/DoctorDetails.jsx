import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { MapPin, Phone, Mail, Star, Calendar, Award, Users, Clock, DollarSign } from "lucide-react";

const DoctorDetails = () => {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDoctorDetails = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`http://localhost:3000/doctors/${doctorId}`);
        setDoctor(res.data);
      } catch (err) {
        console.error("Error fetching doctor details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading doctor details...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    console.log('Doctor not found, showing not found page');
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Doctor Not Found</h2>
          <p className="text-gray-600 mb-6">The doctor you're looking for doesn't exist.</p>
          <button
            onClick={() => navigate('/search-doctors')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  console.log('Doctor data received:', doctor);
  console.log('Doctor name:', doctor?.name);
  console.log('Doctor specialization:', doctor?.specialization);

  // Debug: Check if doctor object exists and has data
  if (!doctor || typeof doctor !== 'object') {
    console.log('Error: Doctor data is invalid');
    return <div>Error loading doctor data</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Background Shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
        <div className="absolute top-40 right-10 w-96 h-96 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse animation-delay-2000"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/search-doctors')}
          className="mb-6 bg-white/80 backdrop-blur-md text-gray-700 px-4 py-2 rounded-lg hover:bg-white/90 transition-all duration-300 border border-white/20"
        >
          ← Back to Search
        </button>

        {/* Doctor Details Card */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-8 border border-white/20">
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Doctor Info */}
            <div className="lg:col-span-1">
              <div className="text-center">
                {/* Doctor Avatar */}
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-white font-bold text-3xl">
                    {doctor.name?.charAt(0)?.toUpperCase()}
                  </span>
                </div>

                {/* Basic Info */}
                <h1 className="text-2xl font-bold text-gray-800 mb-2">{doctor.name}</h1>
                <p className="text-blue-600 font-medium text-lg mb-4">{doctor.specialization}</p>

                {/* Rating */}
                {doctor.averageRating && (
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Star className="w-5 h-5 text-yellow-500 fill-current" />
                    <span className="text-lg font-semibold text-gray-800">{doctor.averageRating}</span>
                    <span className="text-gray-600">({doctor.totalReviews || 0} reviews)</span>
                  </div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Experience</p>
                    <p className="font-semibold text-gray-800">{doctor.experience || 0} years</p>
                  </div>
                  <div className="bg-green-50 rounded-lg p-3">
                    <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <p className="text-sm text-gray-600">Consultation</p>
                    <p className="font-semibold text-gray-800">
                      {doctor.consultationFee ? `Rs. ${doctor.consultationFee}` : 'Not available'}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={() => navigate(`/book-appointment/${doctor.id}`)}
                    className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-3 rounded-lg hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 font-semibold shadow-lg"
                  >
                    Book Appointment
                  </button>
                  <button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition-colors font-semibold">
                    Save Doctor
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* About Section */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  About Doctor
                </h2>
                <p className="text-gray-600 leading-relaxed">
                  {doctor.bio || 'Experienced healthcare professional dedicated to providing quality medical care and patient-centered treatment.'}
                </p>
              </div>

              {/* Qualifications */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-blue-600" />
                  Qualifications
                </h2>
                <div className="flex flex-wrap gap-2">
                  {doctor.qualifications?.map((qual, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {qual}
                    </span>
                  )) || <span className="text-gray-500">No qualifications listed</span>}
                </div>
              </div>

              {/* Clinic Information */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <MapPin className="w-6 h-6 text-blue-600" />
                  Clinic Information
                </h2>
                <div className="bg-gray-50 rounded-lg p-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <p className="font-semibold text-gray-800 mb-2">{doctor.clinic?.name}</p>
                      <p className="text-gray-600 mb-2">{doctor.clinic?.address}</p>
                      <p className="text-gray-600">{doctor.clinic?.city}, {doctor.clinic?.state} {doctor.clinic?.postalCode}</p>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-800">{doctor.phone || doctor.clinic?.phone || 'Not available'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-800">{doctor.email || 'Not available'}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <span className="text-gray-800">Mon-Sat: 9:00 AM - 6:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Availability */}
              <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                  Availability
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => (
                    <div key={day} className={`text-center p-3 rounded-lg border ${index < 6 ? 'bg-green-50 border-green-200' : 'bg-gray-50 border-gray-200'}`}>
                      <p className="font-semibold text-sm text-gray-800">{day}</p>
                      <p className={`text-xs mt-1 ${index < 6 ? 'text-green-600' : 'text-gray-500'}`}>
                        {index < 6 ? 'Available' : 'Closed'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorDetails;
