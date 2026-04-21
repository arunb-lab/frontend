import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, getAuthConfig } from "../utils/auth";
import { showErrorToast } from "../utils/toast";
import { Calendar, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }
    fetchAppointments();
  }, [navigate]);

  const fetchAppointments = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      const res = await axios.get(`${API_BASE}/admin/appointments`, config);
      setAppointments(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Cancellation reason (policy violation, etc.):");
    if (!reason?.trim()) return;
    if (!window.confirm("Cancel this appointment?")) return;
    setCancellingId(id);
    try {
      const config = getAuthConfig();
      await axios.put(`${API_BASE}/appointments/${id}/cancel`, { cancellationReason: reason }, config);
      fetchAppointments();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to cancel");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (d) => (d ? new Date(d).toLocaleDateString() : "-");
  const getStatusColor = (s) => {
    if (s === "approved") return "bg-green-100 text-green-800";
    if (s === "pending") return "bg-yellow-100 text-yellow-800";
    if (s === "rejected" || s === "cancelled") return "bg-red-100 text-red-800";
    if (s === "completed") return "bg-blue-100 text-blue-800";
    return "bg-gray-100 text-gray-800";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">Manage Appointments</h1>
          </div>
          <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-2 text-gray-600 hover:text-gray-800">
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading appointments...</p>
          ) : appointments.length === 0 ? (
            <p className="text-center text-gray-600">No appointments.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-gray-800 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Doctor</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {appointments.map((a) => (
                    <tr key={a._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">{a.patient?.name ?? "-"}</td>
                      <td className="px-4 py-3">{a.doctor?.name ?? "-"}</td>
                      <td className="px-4 py-3">{formatDate(a.appointmentDate)}</td>
                      <td className="px-4 py-3">{a.appointmentTime ?? "-"}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={a.reason}>{a.reason ?? "-"}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(a.status)}`}>{a.status}</span>
                      </td>
                      <td className="px-4 py-3">
                        {(a.status === "pending" || a.status === "approved") && (
                          <button
                            onClick={() => handleCancel(a._id)}
                            disabled={cancellingId === a._id}
                            className="px-3 py-1 rounded bg-red-100 text-red-700 hover:bg-red-200 text-sm"
                          >
                            {cancellingId === a._id ? "..." : "Cancel"}
                          </button>
                        )}
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

export default AdminAppointments;
