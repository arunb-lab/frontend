import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getAuthConfig } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const BookAppointment = () => {
  const navigate = useNavigate();
  const { doctorId } = useParams();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    notes: "",
    isEmergency: false,
  });
  const [bookedSlots, setBookedSlots] = useState([]);

  
  const generateTimeSlots = (start, end) => {
    const slots = [];
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    let cur = sh * 60 + sm;
    const endMin = eh * 60 + em;
    while (cur < endMin) {
      const h = String(Math.floor(cur / 60)).padStart(2, "0");
      const m = String(cur % 60).padStart(2, "0");
      slots.push(`${h}:${m}`);
      cur += 30;
    }
    return slots;
  };

  // Derive available time slots for the selected date
  const getAvailableSlots = () => {
    if (!doctor?.availability || !formData.appointmentDate) return [];
    // Use UTC to avoid timezone shifting the date by one day
    const d = new Date(formData.appointmentDate + "T00:00:00");
    const day = d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
    const daySlots = doctor.availability[day];
    if (!daySlots || daySlots.length === 0) return [];
    const all = daySlots.flatMap((s) => generateTimeSlots(s.start, s.end));
    return all;
  };

  useEffect(() => {
    if (doctorId && formData.appointmentDate) {
      fetchBookedSlots();
    }
  }, [doctorId, formData.appointmentDate]);

  const fetchBookedSlots = async () => {
    try {
      const config = getAuthConfig();
      const res = await axios.get(
        `http://localhost:3000/appointments/booked-slots?doctorId=${doctorId}&date=${formData.appointmentDate}`,
        config
      );
      setBookedSlots(Array.isArray(res.data) ? res.data : res.data?.slots || []);
    } catch (err) {
      console.error("Error fetching booked slots:", err);
    }
  };

  useEffect(() => {
    if (doctorId) {
      fetchDoctorDetails();
    }
  }, [doctorId]);

  const fetchDoctorDetails = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:3000/doctors/${doctorId}`);
      setDoctor(res.data);
    } catch (err) {
      setError("Failed to load doctor details. Please try again.");
      console.error("Error fetching doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
     
      ...(name === "appointmentDate" ? { appointmentTime: "" } : {}),
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    // Validation
    if (!formData.appointmentDate || !formData.appointmentTime || !formData.reason) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }


    const dateObj = new Date(formData.appointmentDate + "T00:00:00");
    const dayOfWeek = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

    if (doctor.availability) {
      const daySlots = doctor.availability[dayOfWeek];
      if (!daySlots || daySlots.length === 0) {
        setError(`Doctor is not available on ${dayOfWeek}s.`);
        setSubmitting(false);
        return;
      }

      // Check time range
      const time = formData.appointmentTime;
      const isWithinSlot = daySlots.some(slot => time >= slot.start && time <= slot.end);
      if (!isWithinSlot) {
        setError(`Doctor is only available between: ${daySlots.map(s => `${s.start} - ${s.end}`).join(", ")}`);
        setSubmitting(false);
        return;
      }

      // Check if slot is booked
      if (bookedSlots.includes(time)) {
        setError("This time slot is already booked. Please choose another time.");
        setSubmitting(false);
        return;
      }
    }

    // Check if date is in the future
    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      setError("Appointment date and time must be in the future");
      setSubmitting(false);
      return;
    }

    // amount for Khalti is consultation fee in paisa
    const amount = Math.round((doctor.consultationFee || 0) * 100);

    
    try {
      const config = getAuthConfig();
      const res = await axios.post(
        "http://localhost:3000/payments/khalti/initiate",
        {
          doctorId,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason,
          notes: formData.notes || undefined,
          isEmergency: formData.isEmergency,
        },
        config
      );
      // Redirect browser to Khalti's hosted payment page
      window.location.href = res.data.payment_url;
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to initiate payment. Please try again.");
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <p className="text-gray-600">Loading doctor details...</p>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="min-h-screen bg-gray-100 p-8 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-red-600">Doctor not found</p>
          <button
            onClick={() => navigate("/search-doctors")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Back to Search
          </button>
        </div>
      </div>
    );
  }

  // Get today's date in YYYY-MM-DD format
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-300 p-8">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => navigate("/search-doctors")}
          className="mb-4 text-blue-600 hover:underline"
        >
          ← Back to Search
        </button>

        <h1 className="text-3xl font-bold text-gray-800 mb-6">Book Appointment</h1>

        {/* Doctor Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Doctor Information</h2>
          <div className="space-y-2">
            <p><span className="font-medium">Name:</span> {doctor.name}</p>
            <p><span className="font-medium">Specialization:</span> {doctor.specialization}</p>
            {(doctor.averageRating > 0 || doctor.totalReviews > 0) && (
              <p>
                <span className="font-medium">Rating:</span> ★ {doctor.averageRating?.toFixed(1) || "0"} 
                ({doctor.totalReviews || 0} review{doctor.totalReviews !== 1 ? "s" : ""})
              </p>
            )}
            {doctor.qualifications && doctor.qualifications.length > 0 && (
              <p><span className="font-medium">Qualifications:</span> {doctor.qualifications.join(", ")}</p>
            )}
            {doctor.experience > 0 && (
              <p><span className="font-medium">Experience:</span> {doctor.experience} years</p>
            )}
            <p>
              <span className="font-medium">Consultation Fee:</span>{" "}
              Rs. {new Intl.NumberFormat("en-NP").format(doctor.consultationFee || 0)}
            </p>

          </div>
        </div>

        {/* Booking Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Appointment Details</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Date *
              </label>
              <input
                type="date"
                name="appointmentDate"
                value={formData.appointmentDate}
                onChange={handleChange}
                min={today}
                required
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Appointment Time *
              </label>

              {!formData.appointmentDate ? (
                <p className="text-sm text-gray-400 italic">Please select a date first to see available slots.</p>
              ) : (() => {
                const slots = getAvailableSlots();
                if (slots.length === 0) {
                  return (
                    <p className="text-sm text-red-500">
                      Doctor has no availability on this day. Please choose another date.
                    </p>
                  );
                }
                return (
                  <>
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 mt-1">
                      {slots.map((slot) => {
                        const isBooked = bookedSlots.includes(slot);
                        const isSelected = formData.appointmentTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            disabled={isBooked}
                            onClick={() => {
                              if (!isBooked) {
                                setFormData((prev) => ({ ...prev, appointmentTime: slot }));
                                setError("");
                              }
                            }}
                            className={`py-1.5 px-2 rounded text-sm font-medium border transition
                              ${
                                isBooked
                                  ? "bg-red-50 text-red-300 border-red-200 cursor-not-allowed line-through"
                                  : isSelected
                                  ? "bg-blue-600 text-white border-blue-600"
                                  : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50"
                              }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {formData.appointmentTime && (
                      <p className="mt-2 text-sm text-blue-700 font-medium">
                        Selected: {formData.appointmentTime}
                      </p>
                    )}
                    {bookedSlots.length > 0 && (
                      <p className="mt-1 text-xs text-red-400">Red slots are already booked.</p>
                    )}
                  </>
                );
              })()}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <textarea
                name="reason"
                value={formData.reason}
                onChange={handleChange}
                required
                rows="4"
                placeholder="Please describe the reason for your appointment..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Additional Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows="3"
                placeholder="Any additional information..."
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div> */}

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isEmergency"
                name="isEmergency"
                checked={formData.isEmergency}
                onChange={handleChange}
                className="rounded border-gray-300 text-red-600 focus:ring-red-500"
              />
              <label htmlFor="isEmergency" className="text-sm font-medium text-gray-700">
                Mark as emergency
              </label>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => navigate("/search-doctors")}
                className="flex-1 bg-gray-200 text-gray-800 py-2 rounded hover:bg-gray-300 transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition"
              >
                {submitting ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookAppointment;
