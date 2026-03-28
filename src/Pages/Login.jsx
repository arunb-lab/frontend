import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import loginImage from "../assets/Login.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await axios.post(
        "http://localhost:3000/users/login",
        { email: email.trim(), password }
      );

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      if (res.data.doctorInfo) localStorage.setItem("doctorInfo", JSON.stringify(res.data.doctorInfo));

      const role = res.data.user.role;
      let redirectPath = "/";
      switch (role) {
        case "admin": redirectPath = "/admin/dashboard"; break;
        case "doctor": redirectPath = "/doctor/dashboard"; break;
        case "patient": redirectPath = "/patient/dashboard"; break;
        default: redirectPath = "/"; 
      }

      showSuccessToast("Login successful!");
      navigate(redirectPath);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Login failed. Check your credentials.";
      setError(errorMessage);
      showErrorToast(errorMessage);
      console.error("Login error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-300 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full flex overflow-hidden">
        
        {/* Left Image */}
        <div className="hidden md:block md:w-1/2 relative">
          <img
            src={loginImage}
            alt="Login"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Login Form */}
        <div className="w-full md:w-1/2 p-10 flex flex-col justify-center">
          <h2 className="text-3xl font-extrabold text-center text-blue-700 mb-6">Welcome Back!</h2>
          <p className="text-center text-gray-500 mb-8">Login to your account</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
           <div className="relative">
  <input
    type={showPassword ? "text" : "password"}
    placeholder="Password"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    required
    className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
  />

  <span
    onClick={() => setShowPassword(!showPassword)}
    className="absolute right-3 top-4 cursor-pointer text-gray-500"
  >
    {showPassword ? <FaEyeSlash /> : <FaEye />}
  </span>
</div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in..." : "Login"}
            </button>

            {/* Stacked Links */}
            <div className="flex flex-col items-center gap-2 mt-3 text-sm text-gray-500">
              <Link to="/forgot-password" className="text-blue-600 hover:underline">
                Forgot password?
              </Link>
              
              <Link to="/register" className="text-blue-600 hover:underline">
                Don't have an account? Register
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
