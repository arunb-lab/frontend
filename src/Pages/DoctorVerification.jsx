import { useEffect, useState } from "react"; 
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, getAuthConfig } from "../utils/auth";
import { CheckCircle, XCircle, UserCheck } from "lucide-react";

const DoctorVerification = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
    }
    fetchDoctors();
  }, [navigate]);

  const fetchDoctors = async () => {
    try {
      const config = getAuthConfig();
      console.log('Fetching pending doctors from:', "http://localhost:3000/admin/pending-doctors");
      const res = await axios.get("http://localhost:3000/admin/pending-doctors", config);
      console.log('Pending doctors response:', res.data);
      console.log('Number of pending doctors:', res.data.length);
      console.log('Response type:', typeof res.data);
      
      if (Array.isArray(res.data)) {
        console.log('Response is array, length:', res.data.length);
        if (res.data.length === 0) {
          console.log('No pending doctors found - all doctors may be verified');
        }
      } else {
        console.log('Response is not array:', res.data);
      }
      
      setDoctors(res.data);
    } catch (err) {
      console.error("Error fetching pending doctors:", err);
      // Set empty array if API fails
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  const verifyDoctor = async (id, status) => {
    try {
      const config = getAuthConfig();
      console.log('Verifying doctor:', id, 'with status:', status);
      await axios.put(`http://localhost:3000/admin/verify-doctor/${id}`, { status }, config);
      console.log('Doctor verification successful');
      setDoctors((prev) => prev.filter((doc) => doc._id !== id));
    } catch (err) {
      console.error("Verification failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-300 via-gray-300 to-gray-300 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <UserCheck className="w-10 h-10 text-blue-600" />
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Doctor Verification Panel
          </h1>
        </div>

        {/* Card */}
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8">
          {loading ? (
            <p className="text-center text-gray-600 text-lg">Loading doctors...</p>
          ) : doctors.length === 0 ? (
            <p className="text-center text-gray-600 text-lg">No pending doctors 🎉</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse shadow-sm rounded-lg overflow-hidden">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
                  <tr>
                    <th className="p-4 text-left font-medium">Name</th>
                    <th className="p-4 text-left font-medium">Email</th>
                    <th className="p-4 text-left font-medium">Specialization</th>
                    <th className="p-4 text-center font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {doctors.map((doc, idx) => (
                    <tr
                      key={doc._id}
                      className={`transition hover:bg-blue-50 ${idx % 2 === 0 ? "bg-gray-50" : "bg-white"}`}
                    >
                      <td className="p-4 text-gray-800 font-medium">{doc.username}</td>
                      <td className="p-4 text-gray-700">{doc.email}</td>
                      <td className="p-4 text-gray-700">{doc.specialization || "N/A"}</td>
                      <td className="p-4 flex justify-center gap-3">
                        <button
                          onClick={() => verifyDoctor(doc._id, "approved")}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white font-semibold transition shadow-md"
                        >
                          <CheckCircle size={18} />
                          Approve
                        </button>

                        <button
                          onClick={() => verifyDoctor(doc._id, "rejected")}
                          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-semibold transition shadow-md"
                        >
                          <XCircle size={18} />
                          Reject
                        </button>
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

export default DoctorVerification;
