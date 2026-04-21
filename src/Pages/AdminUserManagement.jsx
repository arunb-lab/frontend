import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { isAuthenticated, isAdmin, getAuthConfig } from "../utils/auth";
import { showErrorToast } from "../utils/toast";
import { Users, ArrowLeft, Search } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_URL;

const AdminUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated() || !isAdmin()) {
      navigate("/login");
      return;
    }
    fetchUsers();
  }, [navigate, roleFilter, search]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      let url = `${API_BASE}/users`;
      if (roleFilter) url += `?role=${roleFilter}`;
      console.log('Fetching users from:', url);
      const res = await axios.get(url, config);
      console.log('Users response:', res.data);
      if (search) {
        setUsers(res.data.filter(u => u.username.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())));
      } else {
        setUsers(res.data);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
      // Set empty array if API fails
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id, currentActive) => {
    try {
      const config = getAuthConfig();
      await axios.put(`${API_BASE}/users/${id}/status`, { isActive: !currentActive }, config);
      setUsers(prev => prev.map(u => (u._id === id ? { ...u, isActive: !currentActive } : u)));
    } catch (err) {
      console.error(err);
      showErrorToast(err.response?.data?.message || "Failed to update user");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-300 to-slate-200 p-6 md:p-10">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-extrabold text-gray-800">User Management</h1>
          </div>
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" /> Back to Dashboard
          </button>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Filter by role:</label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            >
              <option value="">All</option>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex items-center gap-2 flex-1">
            <Search className="w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by username or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white/80 backdrop-blur-xl rounded-xl shadow-xl p-6">
          {loading ? (
            <p className="text-center text-gray-600">Loading users...</p>
          ) : users.length === 0 ? (
            <p className="text-center text-gray-600">No users found.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-2">
                <thead className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
                  <tr>
                    <th className="px-6 py-3 text-left">Username</th>
                    <th className="px-6 py-3 text-left">Email</th>
                    <th className="px-6 py-3 text-left">Role</th>
                    <th className="px-6 py-3 text-left">Status</th>
                    <th className="px-6 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className="bg-white shadow-md rounded-lg hover:shadow-lg transition-shadow">
                      <td className="px-6 py-4">{u.username}</td>
                      <td className="px-6 py-4">{u.email}</td>
                      <td className="px-6 py-4 capitalize">{u.role}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            u.isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {u.isActive ? "Active" : "Disabled"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {u.role !== "admin" && (
                          <button
                            onClick={() => toggleStatus(u._id, u.isActive)}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                              u.isActive
                                ? "bg-red-100 text-red-700 hover:bg-red-200"
                                : "bg-green-100 text-green-700 hover:bg-green-200"
                            }`}
                          >
                            {u.isActive ? "Disable" : "Enable"}
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

export default AdminUserManagement;
