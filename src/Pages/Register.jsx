import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { showSuccessToast, showErrorToast, showInfoToast } from "../utils/toast";
import registerImage from "../assets/R.jpg";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const SPECIALIZATION_OPTIONS = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Gynecologist",
  "Orthopedic",
  "Neurologist",
  "Psychiatrist",
  "Dentist",
  "Physician",
];

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "patient",
    phone: "",
    address: "",
    dateOfBirth: "",
    // Doctor specific fields
    specialization: "",
    licenseNumber: "",
    qualifications: "",
    experience: "",
    bio: "",
    consultationFee: "",
    // Clinic and location fields
    clinicName: "",
    clinicAddress: "",
    clinicCity: "",
    clinicState: "",
    clinicPostalCode: "",
    clinicPhone: "",
    clinicEmail: "",
    clinicLat: "",
    clinicLng: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Client-side validation
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (formData.role === "doctor" && (!formData.specialization || !formData.licenseNumber)) {
      setError("Specialization and License Number are required for doctor registration");
      setLoading(false);
      return;
    }

    if (formData.role === "doctor" && parseFloat(formData.consultationFee) < 500) {
      setError("Consultation Fee must be at least NRS 500");
      setLoading(false);
      return;
    }

    try {
      // Prepare registration data
      const registrationData = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        role: formData.role,
        phone: formData.phone?.trim() || undefined,
        address: formData.address?.trim() || undefined,
        dateOfBirth: formData.dateOfBirth || undefined,
      };

      // Add doctor-specific fields if role is doctor
      if (formData.role === "doctor") {
        registrationData.specialization = formData.specialization.trim();
        registrationData.licenseNumber = formData.licenseNumber.trim();
        registrationData.qualifications = formData.qualifications
          ? formData.qualifications.split(",").map((q) => q.trim()).filter(q => q)
          : [];
        registrationData.experience = formData.experience ? parseInt(formData.experience) : 0;
        registrationData.bio = formData.bio?.trim() || "";
        registrationData.consultationFee = formData.consultationFee
          ? parseFloat(formData.consultationFee)
          : 500; // Default to minimum required
        
        // Add required clinic and location fields
        registrationData.clinicName = formData.clinicName?.trim() || `${formData.specialization} Clinic`;
        registrationData.clinicAddress = formData.clinicAddress?.trim() || "123 Main Street";
        registrationData.clinicCity = formData.clinicCity?.trim() || "Kathmandu";
        registrationData.clinicState = formData.clinicState?.trim() || "Bagmati";
        registrationData.clinicPostalCode = formData.clinicPostalCode?.trim() || "44600";
        registrationData.clinicPhone = formData.clinicPhone?.trim() || formData.phone?.trim();
        registrationData.clinicEmail = formData.clinicEmail?.trim() || formData.email?.trim();
        registrationData.clinicLat = formData.clinicLat || "27.7172"; // Default Kathmandu coordinates
        registrationData.clinicLng = formData.clinicLng || "85.3240";
      }

      const res = await axios.post("http://localhost:3000/users/register", registrationData);

      if (formData.role === "doctor" && res.data.requiresVerification) {
        showInfoToast(`${res.data.message}\n\nYour doctor account is pending admin verification. You can login, but some features may be limited until an admin verifies your account.`);
      } else {
        showSuccessToast(res.data.message);
      }

      navigate("/login");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || "Registration failed. Please check your connection and try again.";
      setError(errorMessage);
      showErrorToast(errorMessage);
      console.error("Registration error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-300">
      <div className="flex-1 flex items-center justify-center py-8">
        <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl flex overflow-hidden">

          <div className="hidden md:block w-1/2">
            <img src={registerImage} alt="Register" className="h-full w-full object-cover" />
          </div>

          <div className="w-full md:w-1/2 p-8 overflow-y-auto max-h-screen">
            <h2 className="text-2xl font-bold text-center mb-6 text-blue-700">Create Account</h2>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Register as
                </label>
                <select
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded"
                >
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                </select>
                {/* <p className="text-xs text-gray-500 mt-1">
                  Note: Admin accounts can only be created by existing admins
                </p> */}
              </div>

              {/* Common Fields */}
              <input
                type="text"
                name="username"
                placeholder="Full Name"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded"
              />

                 <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              minLength={6}
              className="w-full p-2 pr-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />

            <span
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

              <input
                type="tel"
                name="phone"
                placeholder="Phone Number"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />

              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />
                <label className="block text-sm font-medium text-gray-700 mb-1">
                DOB

              </label>

              <input
                type="date"
                name="dateOfBirth"
                placeholder="Date of Birth (Optional)"
                value={formData.dateOfBirth}
                onChange={handleChange}
                className="w-full p-2 border rounded"
              />

              {/* Doctor Specific Fields */}
              {formData.role === "doctor" && (
                <>
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Doctor Information</h3>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Specialization *
                    </label>
                    <select
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                      className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Specialization</option>
                      {SPECIALIZATION_OPTIONS.map((spec) => (
                        <option key={spec} value={spec}>
                          {spec}
                        </option>
                      ))}
                    </select>
                  </div>

                  <input
                    type="text"
                    name="licenseNumber"
                    placeholder="License Number *"
                    value={formData.licenseNumber}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="text"
                    name="qualifications"
                    placeholder="Qualifications"
                    value={formData.qualifications}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="number"
                    name="experience"
                    placeholder="Years of Experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    className="w-full p-2 border rounded"
                  />

                  <textarea
                    name="bio"
                    placeholder="Bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows="3"
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="number"
                    name="consultationFee"
                    placeholder="Consultation Fee (min 500)"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    min="500"
                    step="50"
                    className="w-full p-2 border rounded"
                  />

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Clinic Information</h3>
                  </div>

                  <input
                    type="text"
                    name="clinicName"
                    placeholder="Clinic Name *"
                    value={formData.clinicName}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="text"
                    name="clinicAddress"
                    placeholder="Clinic Address *"
                    value={formData.clinicAddress}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="text"
                    name="clinicCity"
                    placeholder="Clinic City *"
                    value={formData.clinicCity}
                    onChange={handleChange}
                    required
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="text"
                    name="clinicState"
                    placeholder="Clinic State (Optional)"
                    value={formData.clinicState}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />

                  <input
                    type="text"
                    name="clinicPostalCode"
                    placeholder="Postal Code (Optional)"
                    value={formData.clinicPostalCode}
                    onChange={handleChange}
                    className="w-full p-2 border rounded"
                  />

                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold text-gray-700 mb-3">Location (Optional)</h3>
                    <p className="text-xs text-gray-500 mb-2">Enter coordinates for map display</p>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="number"
                      name="clinicLat"
                      placeholder="Latitude"
                      value={formData.clinicLat}
                      onChange={handleChange}
                      step="0.0001"
                      className="w-full p-2 border rounded"
                    />
                    <input
                      type="number"
                      name="clinicLng"
                      placeholder="Longitude"
                      value={formData.clinicLng}
                      onChange={handleChange}
                      step="0.0001"
                      className="w-full p-2 border rounded"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-800 text-gray-50 py-2.5 rounded-md hover:bg-blue-900 transition font-semibold disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {loading ? "Registering..." : "Register"}
              </button>
            </form>

            <p className="mt-4 text-center text-gray-500 text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-600">Login</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
