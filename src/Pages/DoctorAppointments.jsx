import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getAuthConfig, isAuthenticated, isDoctor } from "../utils/auth";
import { showSuccessToast, showErrorToast } from "../utils/toast";
import { ClipboardList, User, AlertCircle, X } from "lucide-react";

const DoctorAppointments = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    medicines: [{ name: "", dosage: "", duration: "", instruction: "" }],
    advice: ""
  });
  const [isSubmittingPrescription, setIsSubmittingPrescription] = useState(false);

  useEffect(() => {
    if (!isAuthenticated() || !isDoctor()) {
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
        "http://localhost:3000/doctors/appointments/my",
        config
      );
      setAppointments(res.data.appointments || []);
    } catch (err) {
      console.error("Error fetching doctor appointments:", err);
      setError("Failed to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
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
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "cancelled":
        return "bg-gray-100 text-gray-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAction = async (aptId, action, extra = {}) => {
    try {
      const config = getAuthConfig();
      const url = `http://localhost:3000/appointments/${aptId}/${action}`;
      await axios.put(url, extra, config);
      fetchAppointments();
      if (selectedAppointment?._id === aptId) {
        setSelectedPatient(null);
        setSelectedAppointment(null);
      }
    } catch (err) {
      showErrorToast(err.response?.data?.message || `Failed to ${action}`);
    }
  };

  const handleSelectPatient = (appointment) => {
    setSelectedAppointment(appointment);
    setSelectedPatient({
      id: appointment._id,
      name: appointment.patientId?.username || "—",
      email: appointment.patientId?.email || "—",
      phone: appointment.patientId?.phone || "—",
      address: appointment.patientId?.address,
      reason: appointment.reason,
      notes: appointment.notes,
      date: appointment.appointmentDate,
      time: appointment.appointmentTime,
      status: appointment.status,
      isEmergency: appointment.isEmergency,
      primaryDoctor: appointment.doctorId,
      additionalDoctors: appointment.additionalDoctors,
      prescription: appointment.prescription
    });
  };

  const handleAddMedicine = () => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", duration: "", instruction: "" }]
    }));
  };

  const handleRemoveMedicine = (index) => {
    setPrescriptionData(prev => ({
      ...prev,
      medicines: prev.medicines.filter((_, i) => i !== index)
    }));
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...prescriptionData.medicines];
    newMedicines[index][field] = value;
    setPrescriptionData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const handleSubmitPrescription = async () => {
    if (prescriptionData.medicines.some(m => !m.name || !m.dosage)) {
      showErrorToast("Please enter at least medicine name and dosage");
      return;
    }

    setIsSubmittingPrescription(true);
    try {
      const config = getAuthConfig();
      await axios.post(
        `http://localhost:3000/appointments/${selectedAppointment._id}/prescribe`,
        prescriptionData,
        config
      );
      showSuccessToast("Prescription saved successfully");
      setShowPrescriptionModal(false);
      setPrescriptionData({ medicines: [{ name: "", dosage: "", duration: "", instruction: "" }], advice: "" });
      fetchAppointments();
    } catch (err) {
      showErrorToast(err.response?.data?.message || "Failed to save prescription");
    } finally {
      setIsSubmittingPrescription(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-100 flex items-center justify-center">
        <p className="text-gray-700 text-lg">Loading your appointments...</p>
      </div>
    );
  }

  const stats = {
    total: appointments.length,
    pending: appointments.filter(a => a.status === 'pending').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    emergency: appointments.filter(a => a.isEmergency).length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-sky-100 px-6 py-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Practice Insights Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-blue-50 p-3 rounded-xl">
              <ClipboardList className="text-blue-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Patients</p>
              <p className="text-2xl font-bold text-slate-800">{stats.total}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-amber-50 p-3 rounded-xl">
              <AlertCircle className="text-amber-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Approval</p>
              <p className="text-2xl font-bold text-slate-800">{stats.pending}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-red-50 p-3 rounded-xl">
              <AlertCircle className="text-red-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Emergencies</p>
              <p className="text-2xl font-bold text-slate-800">{stats.emergency}</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="bg-green-50 p-3 rounded-xl">
              <ClipboardList className="text-green-600 w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Completed</p>
              <p className="text-2xl font-bold text-slate-800">{stats.completed}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* View Appointments - Left side */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-8 h-8 text-blue-600" />
                Appointment Queue
              </h1>
              <button
                onClick={() => navigate("/doctor/dashboard")}
                className="text-sm font-semibold text-blue-600 hover:text-blue-800"
              >
                ← Back to Dashboard
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {appointments.length === 0 ? (
              <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                <p className="text-gray-600 mb-2">
                  You do not have any upcoming appointments.
                </p>
                <p className="text-xs text-gray-400">
                  Patients can book appointments from the patient portal.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {appointments.map((apt, index) => (
                  <div
                    key={apt._id || apt.id || index}
                    className={`bg-white rounded-xl shadow hover:shadow-xl transition p-5 flex flex-col md:flex-row justify-between gap-4 cursor-pointer border-2 ${
                      selectedAppointment?._id === apt._id ? "border-blue-500 ring-2 ring-blue-200" : "border-transparent"
                    }`}
                    onClick={() => handleSelectPatient(apt)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="text-lg font-semibold text-slate-900">
                          {apt.patientId?.username || "Patient"}
                        </h3>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            apt.status
                            )}`}
                        >
                          {apt.status.charAt(0).toUpperCase() +
                            apt.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        {formatDate(apt.appointmentDate)} •{" "}
                        {formatTime(apt.appointmentTime)}
                      </p>
                      {apt.isEmergency && (
                        <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> Emergency
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-2 items-end">
                      {apt.patientId?.email && <p className="text-sm text-gray-500">{apt.patientId.email}</p>}
                      <div className="flex flex-wrap gap-2 mt-2 justify-end">
                        {apt.status === "pending" && (
                          <button
                            onClick={(e) => { e.stopPropagation(); handleAction(apt._id, "approve"); }}
                            className="px-3 py-1.5 rounded bg-green-600 text-white text-sm hover:bg-green-700"
                          >
                            Approve
                          </button>
                        )}
                        {(apt.status === "approved" || apt.status === "completed") && (
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedAppointment(apt); setShowPrescriptionModal(true); }}
                            className="px-3 py-1.5 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 flex items-center gap-1"
                          >
                            <ClipboardList className="w-4 h-4" /> {apt.status === "completed" ? "Edit Prescription" : "Write Prescription"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Patient Details - Right side panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 h-fit lg:sticky lg:top-6">
            <h2 className="text-xl font-semibold text-slate-900 mb-4 flex items-center gap-2">
              <User className="w-6 h-6 text-purple-600" />
              Patient Details
            </h2>
            {!selectedPatient ? (
              <p className="text-sm text-gray-500">
                Click an appointment above to view patient information.
              </p>
            ) : (
              <div className="space-y-3 text-sm text-gray-700">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Patient Name</p>
                  <p className="font-medium">{selectedPatient.name}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Phone</p>
                  <p>{selectedPatient.phone}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Reason</p>
                  <p>{selectedPatient.reason}</p>
                </div>
                {selectedAppointment && (selectedAppointment.status === "pending" || selectedAppointment.status === "approved") && (
                  <div className="pt-3 border-t flex flex-wrap gap-2">
                    {selectedAppointment.status === "pending" && (
                      <button onClick={() => handleAction(selectedAppointment._id, "approve")} className="w-full px-3 py-2 rounded bg-green-600 text-white text-sm hover:bg-green-700">
                        Approve Appointment
                      </button>
                    )}
                    {(selectedAppointment.status === "approved" || selectedAppointment.status === "completed") && (
                      <button onClick={() => setShowPrescriptionModal(true)} className="w-full px-3 py-2 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700">
                        {selectedAppointment.status === "completed" ? "Update Prescription" : "Write Prescription"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Prescription Modal */}
      {showPrescriptionModal && selectedAppointment && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-blue-600 p-6 text-white flex justify-between items-center sticky top-0 z-10">
              <div>
                <h2 className="text-xl font-bold">Write Prescription</h2>
                <p className="text-blue-100 text-sm">Patient: {selectedPatient.name}</p>
              </div>
              <button 
                onClick={() => setShowPrescriptionModal(false)}
                className="hover:bg-blue-700 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest">Medicines</h3>
                  <button 
                    onClick={handleAddMedicine}
                    className="text-xs bg-blue-50 text-blue-600 font-bold px-3 py-1 rounded-full border border-blue-200 hover:bg-blue-100"
                  >
                    + Add More
                  </button>
                </div>
                
                {prescriptionData.medicines.map((med, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 relative">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Medicine Name</label>
                        <input 
                          type="text" 
                          placeholder="e.g. Paracetamol"
                          value={med.name}
                          onChange={(e) => handleMedicineChange(idx, "name", e.target.value)}
                          className="w-full p-2 border-b-2 border-slate-200 focus:border-blue-500 outline-none bg-transparent"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Dosage</label>
                        <input 
                          type="text" 
                          placeholder="e.g. 500mg - 1-0-1"
                          value={med.dosage}
                          onChange={(e) => handleMedicineChange(idx, "dosage", e.target.value)}
                          className="w-full p-2 border-b-2 border-slate-200 focus:border-blue-500 outline-none bg-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-3">Physician Advice</h3>
                <textarea 
                  rows="4"
                  placeholder="General clinical advice..."
                  value={prescriptionData.advice}
                  onChange={(e) => setPrescriptionData(prev => ({ ...prev, advice: e.target.value }))}
                  className="w-full p-4 bg-slate-50 rounded-xl border border-slate-200 focus:border-blue-500 outline-none resize-none"
                ></textarea>
              </div>

              <div className="flex gap-4 pt-4 border-t">
                <button 
                  onClick={handleSubmitPrescription}
                  disabled={isSubmittingPrescription}
                  className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 transition shadow-lg shadow-blue-200"
                >
                  {isSubmittingPrescription ? "Saving..." : "Save & Complete"}
                </button>
                <button 
                  onClick={() => setShowPrescriptionModal(false)}
                  className="flex-1 bg-slate-100 text-slate-600 font-bold py-3 rounded-xl"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorAppointments;
