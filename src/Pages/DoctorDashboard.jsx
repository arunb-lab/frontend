// frontend/src/Pages/DoctorDashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  CalendarDays,
  ClipboardList,
  UserRound,
  BadgeCheck,
  MessageCircle,
  Users,
  Clock,
  Star,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { isAuthenticated, isDoctor, getDoctorInfo, getAuthConfig } from "../utils/auth";

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [todayAppointments, setTodayAppointments] = useState([]);
  const API = import.meta.env.VITE_API_URL;
  
  useEffect(() => {
    if (!isAuthenticated() || !isDoctor()) {
      navigate("/login");
      return;
    }

    const fetchStatsAndAppointments = async () => {
      try {
        console.log('=== DOCTOR DASHBOARD DATA FETCH ===');
        console.log('Fetching doctor stats and appointments...');
        
        const [statsRes, appointmentsRes] = await Promise.all([
          axios.get(`${API}/doctors/stats`, getAuthConfig())
          axios.get(`${API}/doctors/appointments/my`, getAuthConfig())
        ]);
        
        console.log('Stats response:', statsRes.data);
        console.log('Appointments response:', appointmentsRes.data);
        
        setStats(statsRes.data);
        
        // Filter today's appointments
        const today = new Date().toISOString().split('T')[0];
        const todayApts = appointmentsRes.data.appointments.filter(apt => {
          const aptDate = new Date(apt.appointmentDate).toISOString().split('T')[0];
          return aptDate === today;
        });
        
        console.log('Today\'s appointments:', todayApts);
        console.log('Today\'s appointments count:', todayApts.length);
        
        setTodayAppointments(todayApts);

      } catch (error) {
        console.error("Error fetching doctor data:", error);
        console.error('Error details:', error.response?.data || error.message);
        
        // Set default values if API fails
        setStats({
          todayCount: 0,
          pendingCount: 0,
          totalAppointments: 0,
          averageRating: 0,
          totalReviews: 0
        });
        setTodayAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchStatsAndAppointments();
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const doctorInfo = getDoctorInfo();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10 md:px-10">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
              Control Center
            </h1>
            <p className="text-slate-500 mt-1">
              Welcome back, <span className="font-semibold text-blue-600">Dr. {user.username}</span>. Here's your clinic overview today.
            </p>
          </div>
          {doctorInfo && (
            <div className="flex items-center gap-3 bg-white border border-slate-200 px-4 py-2 rounded-2xl shadow-sm">
              <div className="bg-emerald-100 text-emerald-600 p-2 rounded-xl">
                <BadgeCheck size={20} />
              </div>
              <span className="font-medium text-slate-700">{doctorInfo.specialization}</span>
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg uppercase font-bold tracking-wider">Verified</span>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
                <Users size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.todayCount || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Patients Scheduled</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl">
                <Clock size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.pendingCount || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Requests to review</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
                <ClipboardList size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.totalAppointments || 0}</p>
            <p className="text-sm text-slate-500 mt-1">Consultations to date</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-50 text-yellow-600 rounded-2xl">
                <Star size={24} />
              </div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rating</span>
            </div>
            <div className="flex items-baseline gap-2">
              <p className="text-3xl font-bold text-slate-900">{stats?.averageRating || 0}</p>
              <p className="text-sm text-slate-500">/ 5.0</p>
            </div>
            <p className="text-sm text-slate-500 mt-1">From {stats?.totalReviews || 0} reviews</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Appointment List */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <CalendarDays className="text-blue-600" /> Today's Schedule
              </h2>
              <button 
                onClick={() => navigate("/doctor/appointments")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                View All
              </button>
            </div>
            
            <div className="p-6">
              {todayAppointments.length > 0 ? (
                <div className="space-y-4">
                  {todayAppointments.map((apt) => (
                    <div key={apt._id} className="flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:bg-slate-50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600 font-bold uppercase">
                          {apt.patientId?.username?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{apt.patientId?.username}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock size={12} /> {apt.appointmentTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          apt.status === 'approved' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                        }`}>
                          {apt.status}
                        </span>
                        <button 
                          onClick={() => navigate(`/doctor/appointments`)}
                          className="p-2 hover:bg-white rounded-xl text-slate-400 hover:text-blue-600 transition shadow-sm"
                        >
                          <CheckCircle2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center">
                  <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                    <CalendarDays size={32} />
                  </div>
                  <p className="text-slate-500 font-medium">No appointments scheduled for today.</p>
                  <p className="text-sm text-slate-400 mt-1">Take a break or check your pending requests.</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions & Sidebar */}
          <div className="space-y-6">
            <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-lg shadow-blue-200">
              <h3 className="text-xl font-bold mb-2">Clinic Status</h3>
              <p className="text-blue-100 text-sm mb-6">Your profile is currently active and receiving bookings.</p>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <span className="font-semibold">{stats?.doctorStatus || 'Available'}</span>
              </div>
              <button 
                onClick={() => navigate("/doctor/availability")}
                className="w-full bg-white text-blue-600 py-3 rounded-2xl font-bold hover:bg-slate-50 transition"
              >
                Manage Schedule
              </button>
            </div>

            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4">Quick Tools</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => navigate("/doctor/chat")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <MessageCircle size={20} className="text-slate-400 group-hover:text-blue-600" />
                    <span className="font-medium text-slate-700">Messages</span>
                  </div>
                  <AlertCircle size={16} className="text-red-500" />
                </button>
                <button 
                  onClick={() => navigate("/doctor/appointments")}
                  className="w-full flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/30 transition group"
                >
                  <div className="flex items-center gap-3">
                    <ClipboardList size={20} className="text-slate-400 group-hover:text-emerald-600" />
                    <span className="font-medium text-slate-700">Patient History</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;
