import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaCalendarCheck,
  FaHistory,
  FaComments,
  FaStar,
  FaUserCircle,
  FaCalendarAlt,
  FaStethoscope,
  FaClock
} from "react-icons/fa";
import { getToken, getAuthConfig } from "../utils/auth";

function PatientDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get("http://localhost:3000/appointments/patient-stats", getAuthConfig());
        setStats(response.data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row items-center justify-between bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
          <div className="flex items-center gap-6">
            <div className="bg-blue-100 p-4 rounded-2xl">
              <FaUserCircle className="text-blue-600 text-5xl" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-slate-900">
                Welcome back, {user.username}!
              </h1>
              <p className="text-slate-500 mt-1">
                Here's a summary of your health activities and upcoming appointments.
              </p>
            </div>
          </div>
          <div className="mt-6 md:mt-0">
            <Link
              to="/search-doctors"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition flex items-center gap-2 shadow-lg shadow-blue-200"
            >
              <FaSearch /> Find a Doctor
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-green-50 rounded-xl text-green-600">
                <FaHistory />
              </div>
              <span className="text-slate-500 font-medium">Completed</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.completed || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                <FaCalendarAlt />
              </div>
              <span className="text-slate-500 font-medium">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.total || 0}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Content: Next Appointment */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FaCalendarAlt className="text-blue-600" /> Next Appointment
              </h2>
              
              {stats?.nextAppointment ? (
                <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-600 text-2xl shadow-sm">
                      <FaStethoscope />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">Dr. {stats.nextAppointment.doctor}</h3>
                      <p className="text-blue-600 font-medium">{stats.nextAppointment.specialization}</p>
                      <div className="flex items-center gap-4 mt-2 text-slate-500 text-sm">
                        <span className="flex items-center gap-1"><FaCalendarAlt /> {new Date(stats.nextAppointment.date).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><FaClock /> {stats.nextAppointment.time}</span>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate(`/my-appointments`)}
                    className="bg-white text-blue-600 border border-blue-200 px-6 py-2 rounded-xl font-semibold hover:bg-blue-600 hover:text-white transition shadow-sm"
                  >
                    View Details
                  </button>
                </div>
              ) : (
                <div className="bg-slate-50 rounded-2xl p-10 border border-dashed border-slate-300 text-center">
                  <p className="text-slate-500 italic">No upcoming appointments found.</p>
                  <Link to="/search-doctors" className="text-blue-600 font-semibold mt-2 hover:underline inline-block">
                    Book one now
                  </Link>
                </div>
              )}
            </div>

            {/* Quick Actions (Simplified) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Link to="/patient/chat" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 transition-all flex items-center gap-4">
                <div className="p-4 bg-blue-50 rounded-xl text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition">
                  <FaComments className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">My Messages</h3>
                  <p className="text-sm text-slate-500">Chat with your doctors</p>
                </div>
              </Link>
              <Link to="/my-appointments" className="group bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:border-green-300 transition-all flex items-center gap-4">
                <div className="p-4 bg-green-50 rounded-xl text-green-600 group-hover:bg-green-600 group-hover:text-white transition">
                  <FaHistory className="text-xl" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900">Medical History</h3>
                  <p className="text-sm text-slate-500">View past sessions</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Sidebar: Health Tips or Activity */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
              <h2 className="font-bold text-slate-900 mb-4">Quick Health Tips</h2>
              <ul className="space-y-4">
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0"></div>
                  <p className="text-slate-600">Drink at least 8 glasses of water daily for better hydration.</p>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0"></div>
                  <p className="text-slate-600">Regular 30-minute walks can significantly improve heart health.</p>
                </li>
                <li className="flex gap-3 text-sm">
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                  <p className="text-slate-600">Maintain a consistent sleep schedule of 7-8 hours.</p>
                </li>
              </ul>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
