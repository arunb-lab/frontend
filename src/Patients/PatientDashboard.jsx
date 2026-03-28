import { Link } from "react-router-dom";
import {
  FaSearch,
  FaCalendarPlus,
  FaClipboardList,
  FaComments,
  FaStar,
  FaUserCircle,
} from "react-icons/fa";

function PatientDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 to-gray-400 p-8">

      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-lg p-8 mb-10 flex flex-col md:flex-row items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-800 mb-2">
            Welcome 
          </h1>
          <p className="text-gray-600">
            Manage your appointments and health activities easily.
          </p>
        </div>

        <FaUserCircle className="text-blue-700 text-7xl mt-6 md:mt-0" />
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">

        {/* Search Doctors */}
        <Link
          to="/search-doctors"
          className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4 group-hover:bg-blue-600 transition">
            <FaSearch className="text-blue-700 text-xl group-hover:text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Search Doctors
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Find verified doctors easily
          </p>
        </Link>

        {/* Book Appointment */}
        <Link
          to="/search-doctors"
          className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-green-100 mb-4 group-hover:bg-green-600 transition">
            <FaCalendarPlus className="text-green-600 text-xl group-hover:text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Book Appointment
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Schedule your visit quickly
          </p>
        </Link>

        {/* My Appointments */}
        <Link
          to="/my-appointments"
          className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-purple-100 mb-4 group-hover:bg-purple-600 transition">
            <FaClipboardList className="text-purple-600 text-xl group-hover:text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            My Appointments
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            View your appointment history
          </p>
        </Link>

        {/* Chat */}
        <Link
          to="/patient/chat"
          className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-100 mb-4 group-hover:bg-blue-500 transition">
            <FaComments className="text-blue-500 text-xl group-hover:text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Chat with Doctor
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Communicate instantly
          </p>
        </Link>

        {/* Feedback */}
        <Link
          to="/patient/feedback"
          className="group bg-white p-6 rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-yellow-100 mb-4 group-hover:bg-yellow-500 transition">
            <FaStar className="text-yellow-500 text-xl group-hover:text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">
            Give Feedback
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Share your experience
          </p>
        </Link>

      </div>
    </div>
  );
}

export default PatientDashboard;
