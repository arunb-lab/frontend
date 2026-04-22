import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { getAuthConfig } from "../utils/auth";

const API = import.meta.env.VITE_API_URL; // ✅ added

const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  const verifyCalledRef = useRef(false);

  useEffect(() => {
    if (verifyCalledRef.current) return;
    verifyCalledRef.current = true;

    const pidx = searchParams.get("pidx");
    const khaltiStatus = searchParams.get("status");

    if (!pidx) {
      setStatus("failed");
      setMessage("Invalid payment return — no payment reference found.");
      return;
    }

    if (khaltiStatus && khaltiStatus.toLowerCase().includes("cancel")) {
      setStatus("failed");
      setMessage("Payment was cancelled. Your slot has been freed.");
      return;
    }

    verifyPayment(pidx);
  }, []);

  const verifyPayment = async (pidx) => {
    try {
      const config = getAuthConfig();
      const res = await axios.post(
        `${API}/payments/khalti/verify`, // ✅ fixed
        { pidx },
        config
      );
      setAppointmentInfo(res.data.appointment);
      setStatus("success");
      setMessage(res.data.message || "Appointment booked successfully!");
      setTimeout(() => navigate("/my-appointments"), 3000);
    } catch (err) {
      setStatus("failed");
      setMessage(
        err.response?.data?.message || "Payment verification failed."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

        {status === "verifying" && (
          <>
            <div className="animate-spin w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-700">Verifying your payment…</h2>
          </>
        )}

        {status === "success" && (
          <>
            <div className="text-green-500 text-7xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

        {status === "failed" && (
          <>
            <div className="text-red-500 text-7xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>
            <p className="text-gray-600 mt-2">{message}</p>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentReturn;
