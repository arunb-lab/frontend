import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { 
  Users, 
  UserCheck, 
  Calendar, 
  AlertCircle, 
  TrendingUp, 
  Activity,
  ArrowRight,
  ShieldCheck,
  ClipboardList
} from "lucide-react";
import { isAuthenticated, isAdmin, getAuthConfig } from "../utils/auth";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }

    const fetchStats = async () => {
      try {
        const res = await axios.get("http://localhost:3000/admin/reports", getAuthConfig());
        console.log('Admin stats response:', res.data);
        setStats(res.data);
      } catch (err) {
        console.error("Error fetching admin stats:", err);
        // Set default values if API fails
        setStats({
          users: { patient: 0, doctor: 0, admin: 0 },
          appointments: { pending: 0, approved: 0, rejected: 0, completed: 0, cancelled: 0 },
          doctors: { verified: 0, pending: 0 },
          emergencyCases: 0,
          recentAppointments: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [navigate]);

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-600"></div>
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
              Systems Control
            </h1>
            <p className="text-slate-500 mt-1">
              Administrator Oversight — <span className="font-semibold text-slate-700">{user.username}</span>
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl shadow-lg shadow-slate-200">
            <ShieldCheck size={20} className="text-blue-400" />
            <span className="font-bold tracking-tight uppercase text-xs">Full Authority</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/admin/users" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-600 group-hover:text-white transition">
                <Users size={24} />
              </div>
              <ArrowRight size={16} className="text-slate-300 group-hover:text-slate-600 transition" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.users?.patient || 0}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Active Patients</p>
          </Link>

          <Link to="/admin/verify-doctors" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:bg-emerald-600 group-hover:text-white transition">
                <UserCheck size={24} />
              </div>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full">{stats?.doctors?.pending || 0} Pending</span>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.doctors?.verified || 0}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Verified Doctors</p>
          </Link>

          <Link to="/admin/appointments" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-600 group-hover:text-white transition">
                <Calendar size={24} />
              </div>
              <TrendingUp size={16} className="text-indigo-400" />
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.appointments?.approved || 0}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Active Sessions</p>
          </Link>

          <Link to="/admin/emergency-cases" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-red-500 hover:shadow-md transition group">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-50 text-red-600 rounded-2xl group-hover:bg-red-600 group-hover:text-white transition">
                <AlertCircle size={24} />
              </div>
              <div className="w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            </div>
            <p className="text-3xl font-bold text-slate-900">{stats?.emergencyCases || 0}</p>
            <p className="text-sm text-slate-500 mt-1 font-medium">Emergency Cases</p>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Recent Appointments Activity */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Activity className="text-blue-600" /> System Activity
              </h2>
              <Link to="/admin/reports" className="text-sm font-semibold text-blue-600 hover:text-blue-700">Detailed Analytics</Link>
            </div>
            
            <div className="p-6">
              {stats?.recentAppointments?.length > 0 ? (
                <div className="space-y-4">
                  {stats.recentAppointments.map((apt) => (
                    <div key={apt._id} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                      <div className="flex items-center gap-4">
                        <div className="text-xs font-bold text-slate-400 w-16">
                          {new Date(apt.date).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-800">Pt. {apt.patient} → Dr. {apt.doctor}</p>
                          <p className="text-xs text-slate-500 truncate w-40 md:w-auto">{apt.reason}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                        apt.status === 'approved' ? 'bg-emerald-100 text-emerald-700' : 
                        apt.status === 'completed' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {apt.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center py-10 text-slate-500 italic">No recent activity detected.</p>
              )}
            </div>
          </div>

          {/* Quick Shortcuts Side Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <ClipboardList size={18} className="text-slate-400" /> Administrative Hub
              </h3>
              <div className="grid grid-cols-1 gap-3">
                <Link to="/admin/users" className="flex items-center justify-between p-4 rounded-2xl bg-blue-50/50 hover:bg-blue-50 border border-blue-100 transition group text-sm">
                  <span className="font-semibold text-blue-800">User Registry</span>
                  <ArrowRight size={14} className="text-blue-400 group-hover:translate-x-1 transition" />
                </Link>
                <Link to="/admin/appointments" className="flex items-center justify-between p-4 rounded-2xl bg-indigo-50/50 hover:bg-indigo-50 border border-indigo-100 transition group text-sm">
                  <span className="font-semibold text-indigo-800">Appointment Ledger</span>
                  <ArrowRight size={14} className="text-indigo-400 group-hover:translate-x-1 transition" />
                </Link>
                <Link to="/admin/reports" className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition group text-sm">
                  <span className="font-semibold text-slate-700">Audit Reports</span>
                  <ArrowRight size={14} className="text-slate-400 group-hover:translate-x-1 transition" />
                </Link>
              </div>
            </div>

            <div className="bg-slate-900 rounded-3xl p-6 text-white text-center">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Database Sync</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                <span className="text-sm font-medium">Real-time Connection Listened</span>
              </div>
              <p className="text-[10px] text-slate-500">Last verified: {new Date().toLocaleTimeString()}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
