import { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = import.meta.env.VITE_API_URL; // ✅ added

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const res = await axios.post(`${API}/users/forgot-password`, { // ✅ fixed
        email: email.trim(),
      });
      if (res.data.resetLink) {
        setMessage({
          msg: res.data.message,
          link: res.data.resetLink
        });
      } else {
        setMessage(res.data.message || "Password reset link sent to your email.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Request failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-2">Forgot Password</h2>
        <p className="text-gray-600 text-center text-sm mb-6">
          Enter your email and we&apos;ll send you a link to reset your password.
        </p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded mb-4 text-sm break-words">
            <p>{typeof message === 'object' ? message.msg : message}</p>
            {typeof message === 'object' && message.link && (
              <div className="mt-3">
                <a 
                  href={message.link} 
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition font-semibold"
                >
                  Click here to Reset Password (Demo)
                </a>
                <p className="mt-2 text-[10px] opacity-75 italic">Note: In production, this link is sent to your email.</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed font-medium transition"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
