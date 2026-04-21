import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import { getAuthConfig } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toast";

const BookAppointment = () => {
  const API = import.meta.env.VITE_API_URL;

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
  const [allDoctors, setAllDoctors] = useState([]);
  const [selectedAdditionalDoctors, setSelectedAdditionalDoctors] = useState([]);
  const [fetchingDoctors, setFetchingDoctors] = useState(false);

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

  const getAvailableSlots = () => {
    if (!doctor?.availability || !formData.appointmentDate) return [];
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
        `${API}/appointments/booked-slots?doctorId=${doctorId}&date=${formData.appointmentDate}`,
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
      const res = await axios.get(`${API}/doctors/${doctorId}`);
      setDoctor(res.data);
    } catch (err) {
      setError("Failed to load doctor details. Please try again.");
      console.error("Error fetching doctor:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllDoctors();
  }, [doctorId]);

  const fetchAllDoctors = async () => {
    setFetchingDoctors(true);
    try {
      const res = await axios.get(`${API}/doctors/search`);
      setAllDoctors(res.data.doctors.filter(d => d.id !== doctorId));
    } catch (err) {
      console.error("Error fetching all doctors:", err);
    } finally {
      setFetchingDoctors(false);
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

      const time = formData.appointmentTime;
      const isWithinSlot = daySlots.some(slot => time >= slot.start && time <= slot.end);
      if (!isWithinSlot) {
        setError(`Doctor is only available between: ${daySlots.map(s => `${s.start} - ${s.end}`).join(", ")}`);
        setSubmitting(false);
        return;
      }

      if (bookedSlots.includes(time)) {
        setError("This time slot is already booked. Please choose another time.");
        setSubmitting(false);
        return;
      }
    }

    const appointmentDateTime = new Date(`${formData.appointmentDate}T${formData.appointmentTime}`);
    if (appointmentDateTime < new Date()) {
      setError("Appointment date and time must be in the future");
      setSubmitting(false);
      return;
    }

    try {
      const config = getAuthConfig();
      const res = await axios.post(
        `${API}/payments/khalti/initiate`,
        {
          doctorId,
          additionalDoctorIds: selectedAdditionalDoctors,
          appointmentDate: formData.appointmentDate,
          appointmentTime: formData.appointmentTime,
          reason: formData.reason,
          notes: formData.notes || undefined,
          isEmergency: formData.isEmergency,
        },
        config
      );
      window.location.href = res.data.payment_url;
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to initiate payment. Please try again.");
      setSubmitting(false);
    }
  };

  // ✅ FIX: add return + close component properly
  return (
    <div>
      Book Appointment Page
    </div>
  );
};

export default BookAppointment;
