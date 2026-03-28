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
          {/* Public Links */}
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/">Home</Link>
          </li>
          <li className="hover:text-gray-300 cursor-pointer">
            <Link to="/about">About Us</Link>
          </li>
          
          {authenticated ? (
            <>
              {/* Patient-specific links */}
              {user?.role === "patient" && (
                <>
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
                </>
              )}

              {/* Doctor-specific links */}
              {user?.role === "doctor" && (
                <>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/doctor/dashboard">My Appointments</Link>
                  </li>
                </>
              )}

              {/* Admin-specific links */}
              {user?.role === "admin" && (
                <>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/admin/dashboard">Manage Users</Link>
                  </li>
                  <li className="hover:text-gray-300 cursor-pointer">
                    <Link to="/admin/dashboard">Verify Doctors</Link>
                  </li>
                </>
              )}

              {/* Common authenticated links */}
              <li className="hover:text-gray-300 cursor-pointer">
                <Link to={getDashboardPath()}>Dashboard</Link>
              </li>
              <li>
                <button
                  onClick={handleLogout}
                  className="border border-white px-4 py-2 rounded hover:bg-white hover:text-blue-800 transition"
                >
                  Logout
                </button>
              </li>
            </>
          ) : (
            <>
              {/* Public links when not authenticated */}
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
                <Link to="/contact">Contact</Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="border border-white px-4 py-2 rounded hover:bg-white hover:text-blue-800 transition"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  to="/register"
                  className="bg-white text-blue-700 px-4 py-2 rounded hover:bg-gray-100 transition"
                >
                  Register
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
