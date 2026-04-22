import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  FaSearch,
  FaHistory,
  FaComments,
  FaUserCircle,
  FaCalendarAlt,
  FaStethoscope,
  FaClock
} from "react-icons/fa";
import { getToken, getAuthConfig } from "../utils/auth";

const API = import.meta.env.VITE_API_URL; // ✅ added

function PatientDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          `${API}/appointments/patient-stats`, // ✅ fixed
          getAuthConfig()
        );
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

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-slate-500">Completed</span>
            <p className="text-3xl font-bold">{stats?.completed || 0}</p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <span className="text-slate-500">Total</span>
            <p className="text-3xl font-bold">{stats?.total || 0}</p>
          </div>
        </div>

        <div>
          {stats?.nextAppointment ? (
            <div>
              <h3>Dr. {stats.nextAppointment.doctor}</h3>
              <p>{stats.nextAppointment.time}</p>
            </div>
          ) : (
            <p>No upcoming appointments</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default PatientDashboard;
