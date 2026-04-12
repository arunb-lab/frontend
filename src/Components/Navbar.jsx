import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { isAuthenticated, getUser, logout, hasRole } from "../utils/auth";

const Navbar = () => {
  const navigate = useNavigate();
  const authenticated = isAuthenticated();
  const user = getUser();

  const handleLogout = () => {
    logout();
    navigate("/");
    window.location.reload(); // Refresh to update navbar
  };

  const getDashboardPath = () => {
    if (!user) return "/";
    switch (user.role) {
      case "admin":
        return "/admin/dashboard";
      case "doctor":
        return "/doctor/dashboard";
      case "patient":
        return "/patient/dashboard";
      default:
        return "/";
    }
  };

  return (
    <nav className="bg-gradient-to-r from-slate-600 to-blue-800 shadow-lg px-10 py-4">
      <div className="flex justify-between items-center">
        <Link to="/">
          <h1 className="text-3xl font-bold text-white cursor-pointer">HEALTHSEVA</h1>
        </Link>
        
        <ul className="hidden md:flex space-x-6 font-medium items-center text-white">
          {authenticated ? (
            <>
              {/* Patient-specific links */}
              {user?.role === "patient" && (
                <>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/patient/dashboard">Dashboard</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/departments">Departments</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/search-doctors">Search Doctors</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/nearby-doctors">Nearby Doctors</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/my-appointments">My Appointments</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
  <Link to="/patient/chat">Message</Link>
</li>
                </>
              )}

              {/* Doctor-specific links */}
              {user?.role === "doctor" && (
                <>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/doctor/dashboard">Dashboard</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/doctor/availability">My Availability</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/doctor/appointments">My Appointments</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/doctor/chat">Messages</Link>
                  </li>
                </>
              )}

              {/* Admin-specific links */}
              {user?.role === "admin" && (
                <>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/admin/dashboard">Dashboard</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/admin/users">Manage Users</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/admin/verification">Doctor Verification</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/admin/emergency">Emergency Cases</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/admin/reports">Reports</Link>
                  </li>
                </>
              )}
            </>
          ) : (
            <>
              {/* Public Links - Only show when NOT logged in */}
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to="/">Home</Link>
              </li>
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to="/about">About Us</Link>
              </li>
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to="/departments">Departments</Link>
              </li>
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to="/search-doctors">Search Doctors</Link>
              </li>
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to="/nearby-doctors">Nearby Doctors</Link>
              </li>
            </>
          )}
          
          {/* Auth buttons */}
          {authenticated ? (
            <li>
              <button
                onClick={handleLogout}
                className="border border-white px-4 py-2 rounded hover:bg-white hover:text-blue-800 transition"
              >
                Logout
              </button>
            </li>
          ) : (
            <>
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to="/login">Login</Link>
              </li>
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to="/register">Register</Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
