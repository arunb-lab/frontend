import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { getAuthConfig } from "../utils/auth";

/**
 * Khalti v2 return page.
 * Khalti redirects here after payment with query params:
 *   ?pidx=...&status=Completed&transaction_id=...&amount=...&purchase_order_id=...
 * This page reads the pidx, calls the backend verify endpoint, and shows the result.
 */
const PaymentReturn = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("verifying"); // "verifying" | "success" | "failed"
  const [message, setMessage] = useState("");
  const [appointmentInfo, setAppointmentInfo] = useState(null);
  // Guard against React StrictMode double-invoking the effect in development
  const verifyCalledRef = useRef(false);

  useEffect(() => {
    if (verifyCalledRef.current) return; // already running — skip duplicate
    verifyCalledRef.current = true;

    const pidx         = searchParams.get("pidx");
    const khaltiStatus = searchParams.get("status");

    if (!pidx) {
      setStatus("failed");
      setMessage("Invalid payment return — no payment reference found.");
      return;
    }

    // Khalti sends "User canceled" when the user closes/cancels the Khalti page
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
        "http://localhost:3000/payments/khalti/verify",
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
        err.response?.data?.message || "Payment verification failed. Please contact support."
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-md w-full text-center">

        {/* Verifying */}
        {status === "verifying" && (
          <>
            <div className="animate-spin w-14 h-14 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6" />
            <h2 className="text-xl font-semibold text-gray-700">Verifying your payment…</h2>
            <p className="text-gray-500 mt-2 text-sm">Please wait, do not close this page.</p>
          </>
        )}

        {/* Success */}
        {status === "success" && (
          <>
            <div className="text-green-500 text-7xl mb-4">✓</div>
            <h2 className="text-2xl font-bold text-green-700">Payment Successful!</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            {appointmentInfo && (
              <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 text-left text-sm text-gray-700 space-y-1">
                <p><span className="font-medium">Doctor:</span> {appointmentInfo.doctor?.name}</p>
                <p>
                  <span className="font-medium">Date:</span>{" "}
                  {new Date(appointmentInfo.appointmentDate).toLocaleDateString("en-US", {
                    weekday: "long", year: "numeric", month: "long", day: "numeric",
                  })}
                </p>
                <p><span className="font-medium">Time:</span> {appointmentInfo.appointmentTime}</p>
                {appointmentInfo.payment?.transactionId && (
                  <p><span className="font-medium">Transaction ID:</span> {appointmentInfo.payment.transactionId}</p>
                )}
              </div>
            )}
            <p className="text-sm text-gray-400 mt-4">Redirecting to your appointments in 3 s…</p>
          </>
        )}

        {/* Failed */}
        {status === "failed" && (
          <>
            <div className="text-red-500 text-7xl mb-4">✗</div>
            <h2 className="text-2xl font-bold text-red-700">Payment Failed</h2>
            <p className="text-gray-600 mt-2">{message}</p>
            <div className="mt-6 flex gap-3 justify-center">
              <button
                onClick={() => navigate("/search-doctors")}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Try Again
              </button>
              <button
                onClick={() => navigate("/my-appointments")}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                My Appointments
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
};

export default PaymentReturn;
