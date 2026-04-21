import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, getAuthConfig } from "../utils/auth";
import { AlertTriangle, ArrowLeft } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminEmergencyCases = () => {
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }
    fetchEmergencyCases();
  }, [navigate]);

  const fetchEmergencyCases = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      console.log('Fetching emergency cases from:', `${API_BASE}/emergency-cases`);
      const res = await axios.get(`${API_BASE}/emergency-cases`, config);
      console.log('Emergency cases response:', res.data);
      setCases(res.data);
    } catch (err) {
      console.error("Error fetching emergency cases:", err);
      // Set empty array if API fails
      setCases([]);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return "-";
    return new Date(d).toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <h1 className="text-3xl font-bold text-gray-800">Emergency Cases</h1>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-xl p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading emergency cases...</p>
          ) : cases.length === 0 ? (
            <p className="text-center text-gray-600">No emergency cases at the moment.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                  <tr>
                    <th className="px-4 py-3 text-left">Patient</th>
                    <th className="px-4 py-3 text-left">Doctor</th>
                    <th className="px-4 py-3 text-left">Specialization</th>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Reason</th>
                    <th className="px-4 py-3 text-left">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {cases.map((c) => (
                    <tr key={c._id} className="hover:bg-amber-50/50">
                      <td className="px-4 py-3">
                        <div>{c.patient?.name ?? "-"}</div>
                        <div className="text-xs text-gray-500">{c.patient?.email}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div>{c.doctor?.name ?? "-"}</div>
                        <div className="text-xs text-gray-500">{c.doctor?.email}</div>
                      </td>
                      <td className="px-4 py-3">{c.specialization ?? "-"}</td>
                      <td className="px-4 py-3">{formatDate(c.appointmentDate)}</td>
                      <td className="px-4 py-3">{c.appointmentTime ?? "-"}</td>
                      <td className="px-4 py-3 max-w-xs truncate" title={c.reason}>{c.reason ?? "-"}</td>
                      <td className="px-4 py-3">{c.status}</td>
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

export default AdminEmergencyCases;
