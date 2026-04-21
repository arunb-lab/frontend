import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, getAuthConfig } from "../utils/auth";
import { BarChart3, ArrowLeft, Users, Calendar, Stethoscope, AlertTriangle } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminReports = () => {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }
    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      const res = await axios.get(`${API_BASE}/reports`, config);
      setReport(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <p className="text-gray-600 text-lg font-medium">Loading reports...</p>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        <p className="text-red-600 text-lg font-medium">Failed to load reports.</p>
      </div>
    );
  }

  const { users, appointments, doctors, emergencyCases, recentAppointments } = report;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-extrabold text-gray-800">System Reports & Analytics</h1>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-blue-100 hover:scale-105 transform transition">
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-8 h-8 text-blue-500" />
              <h3 className="font-semibold text-gray-800">Users</h3>
            </div>
            <p className="text-lg text-gray-600 mb-1">Patients: {users?.patient ?? 0}</p>
            <p className="text-lg text-gray-600 mb-1">Doctors: {users?.doctor ?? 0}</p>
            <p className="text-lg text-gray-600">Admins: {users?.admin ?? 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-green-100 hover:scale-105 transform transition">
            <div className="flex items-center gap-3 mb-3">
              <Calendar className="w-8 h-8 text-green-600" />
              <h3 className="font-semibold text-gray-800">Appointments</h3>
            </div>
            {["pending", "approved", "rejected", "completed", "cancelled"].map((status) => (
              <p key={status} className="text-lg text-gray-600 capitalize">
                {status}: {appointments?.[status] ?? 0}
              </p>
            ))}
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-indigo-100 hover:scale-105 transform transition">
            <div className="flex items-center gap-3 mb-3">
              <Stethoscope className="w-8 h-8 text-indigo-600" />
              <h3 className="font-semibold text-gray-800">Doctors</h3>
            </div>
            <p className="text-lg text-gray-600">Verified: {doctors?.verified ?? 0}</p>
            <p className="text-lg text-gray-600">Pending: {doctors?.pending ?? 0}</p>
          </div>

          <div className="bg-white/80 backdrop-blur-lg rounded-xl shadow-lg p-6 border border-amber-100 hover:scale-105 transform transition">
            <div className="flex items-center gap-3 mb-3">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
              <h3 className="font-semibold text-gray-800">Emergency Cases</h3>
            </div>
            <p className="text-2xl font-bold text-gray-800">{emergencyCases ?? 0}</p>
          </div>
        </div>

        {/* Recent Appointments Table */}
        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Appointments</h2>
          {recentAppointments?.length === 0 ? (
            <p className="text-gray-600">No appointments yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg">
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Doctor</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentAppointments?.map((a) => (
                    <tr key={a._id} className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
                      <td className="px-4 py-3">{formatDate(a.date)}</td>
                      <td className="px-4 py-3">{a.time ?? "-"}</td>
                      <td className="px-4 py-3">{a.patient ?? "-"}</td>
                      <td className="px-4 py-3">{a.doctor ?? "-"}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={a.reason}>{a.reason ?? "-"}</td>
                      <td className="px-4 py-3 capitalize">
                        <span
                          className={`px-2 py-1 rounded-full text-sm font-medium ${
                            a.status === "completed"
                              ? "bg-green-100 text-green-800"
                              : a.status === "pending"
                              ? "bg-yellow-100 text-yellow-800"
                              : a.status === "cancelled"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                          }`}
                        >
                          {a.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminReports;
