import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getAuthConfig } from "../utils/auth";
import { showSuccessToast, showErrorToast, showWarningToast } from "../utils/toast";
import { Star } from "lucide-react";

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReasons, setCancelReasons] = useState({});
  const [reviewingId, setReviewingId] = useState(null);
  const [reviewRating, setReviewRating] = useState({});
  const [reviewText, setReviewText] = useState({});

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const config = getAuthConfig();
      const res = await axios.get("http://localhost:3000/appointments/my", config);
      setAppointments(res.data.appointments);
    } catch (err) {
      setError("Failed to load appointments. Please try again.");
      console.error("Error fetching appointments:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (appointmentId) => {
    const cancelReason = cancelReasons[appointmentId] || "";
    
    if (!cancelReason.trim()) {
      showWarningToast("Please provide a reason for cancellation");
      return;
    }

    if (!window.confirm("Are you sure you want to cancel this appointment?")) {
      return;
    }

    setCancellingId(appointmentId);
    try {
      const config = getAuthConfig();
      await axios.put(
        `http://localhost:3000/appointments/${appointmentId}/cancel`,
        { cancellationReason: cancelReason },
        config
      );

      showSuccessToast("Appointment cancelled successfully");
      setCancelReasons(prev => {
        const newReasons = { ...prev };
        delete newReasons[appointmentId];
        return newReasons;
      });
      setCancellingId(null);
      fetchAppointments();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to cancel appointment");
      console.error("Cancel error:", err);
    } finally {
      setCancellingId(null);
    }
  };

  const handleCancelReasonChange = (appointmentId, value) => {
    setCancelReasons(prev => ({
      ...prev,
      [appointmentId]: value
    }));
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(":");
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":        return "bg-green-100 text-green-800";
      case "pending":         return "bg-yellow-100 text-yellow-800";
      case "payment_pending": return "bg-orange-100 text-orange-800";
      case "rejected":        return "bg-red-100 text-red-800";
      case "cancelled":       return "bg-gray-100 text-gray-800";
      case "completed":       return "bg-blue-100 text-blue-800";
      default:                return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status) => {
    if (status === "payment_pending") return "Awaiting Payment";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const canCancel = (appointment) => (
    appointment.status === "pending" || appointment.status === "approved"
  );

  const handleSubmitReview = async (appointmentId) => {
    const rating = reviewRating[appointmentId];
    if (!rating) {
      showWarningToast("Please select a rating (1-5 stars)");
      return;
    }
    setReviewingId(appointmentId);
    try {
      const config = getAuthConfig();
      await axios.post(
        "http://localhost:3000/reviews",
        { appointmentId, rating, review: reviewText[appointmentId] || "" },
        config
      );
      showSuccessToast("Thank you for your feedback!");
      setReviewRating((prev) => { const p = { ...prev }; delete p[appointmentId]; return p; });
      setReviewText((prev) => { const p = { ...prev }; delete p[appointmentId]; return p; });
      setReviewingId(null);
      fetchAppointments();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to submit review");
    } finally {
      setReviewingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-300 flex items-center justify-center p-8">
        <p className="text-gray-700 text-lg">Loading appointments...</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-300 px-10 py-20 min-h-screen flex flex-col items-center">
      <div className="max-w-6xl w-full space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <h1 className="text-4xl font-bold text-gray-800">My Appointments</h1>
          <button
            onClick={() => navigate("/search-doctors")}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
          >
            Book New Appointment
          </button>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg shadow">
            {error}
          </div>
        )}

        {/* No appointments */}
        {appointments.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-10 text-center">
            <p className="text-gray-600 text-lg mb-6">You don't have any appointments yet.</p>
            <button
              onClick={() => navigate("/search-doctors")}
              className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition shadow-md"
            >
              Book Your First Appointment
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {appointments.map((appointment) => (
              <div
                key={appointment.id}
                className="bg-white rounded-xl shadow-lg hover:shadow-2xl transition p-6 md:p-8"
              >
                {/* Doctor Info */}
                <div className="flex flex-col md:flex-row justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h3 className="text-2xl font-semibold text-gray-800">
                        Dr. {appointment.doctor.name}
                      </h3>
                      {appointment.payment && (
                        <span className="text-sm text-gray-600 ml-2">
                          ({appointment.payment.status.toUpperCase()} • Rs{(appointment.payment.amount/100).toFixed(2)})
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>
                    <p className="text-blue-600 font-medium">{appointment.doctor.specialization}</p>
                    {appointment.doctor.email && <p className="text-gray-600">{appointment.doctor.email}</p>}
                    {appointment.doctor.phone && <p className="text-gray-600">{appointment.doctor.phone}</p>}
                  </div>
                  <div className="text-right mt-4 md:mt-0">
                    <p className="text-sm text-gray-600">Consultation Fee</p>
                    <p className="text-xl font-semibold text-gray-800">
                      Rs.{appointment.consultationFee || 0}
                    </p>
                  </div>
                </div>

                {/* Appointment Date & Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Appointment Date</p>
                    <p className="font-medium text-gray-800">{formatDate(appointment.appointmentDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Appointment Time</p>
                    <p className="font-medium text-gray-800">{formatTime(appointment.appointmentTime)}</p>
                  </div>
                </div>

                {/* Reason & Notes */}
                {appointment.reason && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Reason for Visit</p>
                    <p className="text-gray-800">{appointment.reason}</p>
                  </div>
                )}
                {appointment.notes && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="text-gray-800">{appointment.notes}</p>
                  </div>
                )}

                {/* Cancellation Reason */}
                {appointment.status === "cancelled" && appointment.cancellationReason && (
                  <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm font-medium text-red-800">Cancellation Reason</p>
                    <p className="text-red-700">{appointment.cancellationReason}</p>
                  </div>
                )}

                {/* Rate & Review (completed appointments) */}
                {appointment.status === "completed" && appointment.hasReviewed && (
                  <p className="mb-4 text-green-700 font-medium">✓ You have reviewed this appointment.</p>
                )}
                {appointment.status === "completed" && !appointment.hasReviewed && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm font-medium text-blue-800 mb-2">Rate & Review Dr. {appointment.doctor.name}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setReviewRating((prev) => ({ ...prev, [appointment.id]: star }))}
                          className="p-0.5"
                        >
                          <Star
                            className={`w-8 h-8 ${(reviewRating[appointment.id] || 0) >= star ? "fill-amber-400 text-amber-400" : "text-gray-300"}`}
                          />
                        </button>
                      ))}
                      <span className="ml-2 text-sm text-gray-600">
                        {(reviewRating[appointment.id] || 0)} / 5
                      </span>
                    </div>
                    <textarea
                      placeholder="Leave a review (optional)"
                      value={reviewText[appointment.id] || ""}
                      onChange={(e) => setReviewText((prev) => ({ ...prev, [appointment.id]: e.target.value }))}
                      className="w-full p-2 border rounded mb-2 text-sm"
                      rows="2"
                    />
                    <button
                      onClick={() => handleSubmitReview(appointment.id)}
                      disabled={reviewingId === appointment.id}
                      className="bg-blue-600 text-white px-4 py-2 rounded text-sm hover:bg-blue-700 disabled:opacity-50"
                    >
                      {reviewingId === appointment.id ? "Submitting..." : "Submit Review"}
                    </button>
                  </div>
                )}

                {/* Cancel Appointment */}
                {canCancel(appointment) && (
                  <div className="border-t pt-4 mt-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <input
                        type="text"
                        placeholder="Reason for cancellation (required)"
                        value={cancelReasons[appointment.id] || ""}
                        onChange={(e) => handleCancelReasonChange(appointment.id, e.target.value)}
                        className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                      <button
                        onClick={() => handleCancel(appointment.id)}
                        disabled={cancellingId === appointment.id || !cancelReasons[appointment.id]?.trim()}
                        className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition shadow-md"
                      >
                        {cancellingId === appointment.id ? "Cancelling..." : "Cancel Appointment"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyAppointments;