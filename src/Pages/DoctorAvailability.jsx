import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthConfig, isAuthenticated, isDoctor } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

const DoctorAvailability = () => {
  const API = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("Available");
  const [availability, setAvailability] = useState({
    monday: [],
    tuesday: [],
    wednesday: [],
    thursday: [],
    friday: [],
    saturday: [],
    sunday: [],
  });

  useEffect(() => {
    if (!isAuthenticated() || !isDoctor()) {
      navigate("/login");
      return;
    }
    fetchDoctorProfile();
  }, [navigate]);

  const fetchDoctorProfile = async () => {
    setLoading(true);
    try {
      const config = getAuthConfig();
      const res = await axios.get(
        `${API}/doctors/profile`,
        config
      );
      if (res.data) {
        if (res.data.status) setStatus(res.data.status);
        if (res.data.availability) setAvailability(res.data.availability);
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = (e) => {
    setStatus(e.target.value);
  };

  const handleDayToggle = (day) => {
    setAvailability((prev) => {
      const currentSlots = prev[day];
      if (currentSlots && currentSlots.length > 0) {
        return { ...prev, [day]: [] };
      } else {
        return { ...prev, [day]: [{ start: "09:00", end: "17:00" }] };
      }
    });
  };

  const handleTimeChange = (day, index, field, value) => {
    setAvailability((prev) => {
      const newSlots = [...prev[day]];
      newSlots[index] = { ...newSlots[index], [field]: value };
      return { ...prev, [day]: newSlots };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const config = getAuthConfig();
      await axios.put(
        `{API}/doctors/availability`,
        { status, availability },
        config
      );
      showSuccessToast("Availability updated successfully!");
      navigate("/doctor/dashboard");
    } catch (err) {
      showErrorToast("Failed to update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <button
            onClick={() => navigate("/doctor/dashboard")}
            className="text-blue-600 font-medium hover:underline"
          >
            ← Back
          </button>
          <h1 className="text-3xl font-bold text-gray-800">
            Manage Your Availability
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-2xl p-8 space-y-10"
        >
          {/* Status Section */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">
              Current Status
            </h2>

            <div className="flex gap-6">
              {["Available", "Busy", "On Leave"].map((s) => (
                <label
                  key={s}
                  className={`cursor-pointer px-6 py-3 rounded-xl border-2 transition-all duration-200 ${
                    status === s
                      ? "border-blue-600 bg-blue-50 shadow-md"
                      : "border-gray-200 bg-gray-50 hover:border-blue-400"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={s}
                    checked={status === s}
                    onChange={handleStatusChange}
                    className="hidden"
                  />
                  <span
                    className={`font-medium ${
                      s === "Available"
                        ? "text-green-600"
                        : s === "Busy"
                        ? "text-yellow-600"
                        : "text-red-600"
                    }`}
                  >
                    {s}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <hr />

          {/* Weekly Schedule */}
          <div>
            <h2 className="text-xl font-semibold mb-6 text-gray-700">
              Weekly Schedule
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              {DAYS_OF_WEEK.map((day) => {
                const isEnabled =
                  availability[day] && availability[day].length > 0;

                return (
                  <div
                    key={day}
                    className={`rounded-xl p-5 border transition-all ${
                      isEnabled
                        ? "border-green-400 bg-green-50 shadow-md"
                        : "border-gray-200 bg-white"
                    }`}
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={isEnabled}
                          onChange={() => handleDayToggle(day)}
                          className="w-5 h-5 accent-blue-600"
                        />
                        <span className="capitalize font-semibold text-lg">
                          {day}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isEnabled
                            ? "text-green-600"
                            : "text-gray-400"
                        }`}
                      >
                        {isEnabled ? "Active" : "Off"}
                      </span>
                    </div>

                    {isEnabled && (
                      <div className="mt-4 bg-white p-4 rounded-lg shadow-sm">
                        {availability[day].map((slot, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-4"
                          >
                            <div>
                              <label className="text-xs text-gray-500">
                                Start
                              </label>
                              <input
                                type="time"
                                value={slot.start}
                                onChange={(e) =>
                                  handleTimeChange(
                                    day,
                                    index,
                                    "start",
                                    e.target.value
                                  )
                                }
                                className="block mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                              />
                            </div>

                            <div>
                              <label className="text-xs text-gray-500">
                                End
                              </label>
                              <input
                                type="time"
                                value={slot.end}
                                onChange={(e) =>
                                  handleTimeChange(
                                    day,
                                    index,
                                    "end",
                                    e.target.value
                                  )
                                }
                                className="block mt-1 border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-400"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-6">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-10 py-3 rounded-xl shadow-lg transition-all disabled:opacity-60"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DoctorAvailability;
