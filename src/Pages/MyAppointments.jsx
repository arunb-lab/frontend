import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuthConfig, isAuthenticated } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import { Calendar, Clock, MapPin, Phone, User, X, FileText, Download, Star } from "lucide-react";
import { jsPDF } from "jspdf";

const API = import.meta.env.VITE_API_URL; // ✅ added

const MyAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate("/login");
      return;
    }
    fetchAppointments();
  }, [navigate]);

  const fetchAppointments = async () => {
    setLoading(true);
    setError("");
    try {
      const config = getAuthConfig();

      const res = await axios.get(
        `${API}/appointments/my`, // ✅ fixed
        config
      );

      setAppointments(res.data.appointments || []);
    } catch (err) {
      setError("Failed to load your appointments.");
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (id) => {
    const reason = prompt("Please provide a reason for cancellation:");
    if (!reason?.trim()) return;

    try {
      const config = getAuthConfig();
      await axios.put(
        `${API}/appointments/${id}/cancel`, // ✅ fixed
        { cancellationReason: reason },
        config
      );
      showSuccessToast("Appointment cancelled");
      fetchAppointments();
    } catch (err) {
      showErrorToast("Cancel failed");
    }
  };

  const fetchAvailableSlots = async (date) => {
    if (!date || !selectedAppointment) return;

    try {
      const config = getAuthConfig();
      const doctorId = selectedAppointment.doctorId?._id;

      const res = await axios.get(
        `${API}/doctors/slots/${doctorId}?date=${date}`, // ✅ fixed
        config
      );

      setAvailableSlots(res.data.availableSlots || []);
    } catch {
      setAvailableSlots([]);
    }
  };

  const handleRescheduleSubmit = async () => {
    if (!newDate || !newTime) return;

    try {
      const config = getAuthConfig();
      const appointmentId = selectedAppointment._id;

      await axios.put(
        `${API}/appointments/${appointmentId}/reschedule`, // ✅ fixed
        { appointmentDate: newDate, appointmentTime: newTime },
        config
      );

      showSuccessToast("Rescheduled");
      setShowRescheduleModal(false);
      fetchAppointments();
    } catch {
      showErrorToast("Failed");
    }
  };

  const handleSubmitReview = async (appointmentId) => {
    try {
      const config = getAuthConfig();

      await axios.post(
        `${API}/reviews`, // ✅ fixed
        { appointmentId },
        config
      );

      showSuccessToast("Review submitted");
      fetchAppointments();
    } catch {
      showErrorToast("Review failed");
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h1>My Appointments</h1>

      {appointments.map((apt) => (
        <div key={apt._id}>
          <p>{apt.reason}</p>
          <button onClick={() => handleCancel(apt._id)}>Cancel</button>
        </div>
      ))}
    </div>
  );
};

export default MyAppointments;
