import { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";


const CORRECT_PHONE= "9800000001";
const CORRECT_MPIN= "1111";
const CORRECT_OTP = "987654";

export default function MockKhaltiPayment() {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const pidx = params.get("pidx")   || "";
  const amount = params.get("amount") || "0";
  const name= params.get("name")   || "Appointment";

  const amountNPR = (parseInt(amount, 10) / 100).toFixed(2);



  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [mpin, setMpin] = useState("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const buildReturnUrl = (status) => {
    const txn = `TEST_TXN_${Date.now()}`;
    return `/payment/return?pidx=${pidx}&status=${encodeURIComponent(status)}&transaction_id=${txn}&total_amount=${amount}&purchase_order_name=${encodeURIComponent(name)}`;
  };

  const handleCancel = () => navigate(buildReturnUrl("User canceled"));

  const handlePhoneSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (phone !== CORRECT_PHONE) {
      setError(`Invalid phone number. Use test number: ${CORRECT_PHONE}`);
      return;
    }
    setStep("mpin");
  };

  const handleMpinSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (mpin !== CORRECT_MPIN) {
      setError(`Wrong MPIN. Use test MPIN: ${CORRECT_MPIN}`);
      return;
    }
    setStep("otp");
  };

  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (otp !== CORRECT_OTP) {
      setError(`Wrong OTP. Use test OTP: ${CORRECT_OTP}`);
      return;
    }
    setLoading(true);
    // Simulate a brief processing delay then redirect to return page
    setTimeout(() => {
      navigate(buildReturnUrl("Completed"));
    }, 1800);
  };

  const Card = ({ children }) => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Khalti-styled header */}
        <div className="bg-[#5C2D8E] px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Khalti-style logo mark */}
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <span className="text-[#5C2D8E] font-black text-sm">K</span>
            </div>
            <span className="text-white font-bold text-lg tracking-wide">Khalti</span>
          </div>
          <span className="text-purple-200 text-xs border border-purple-400 rounded px-2 py-0.5">
            TEST MODE
          </span>
        </div>

        {/* Amount banner */}
        <div className="bg-[#f5f0fb] px-6 py-3 border-b text-center">
          <p className="text-xs text-gray-500 mb-0.5">Paying for</p>
          <p className="text-sm font-semibold text-gray-700 truncate">{name}</p>
          <p className="text-2xl font-bold text-[#5C2D8E] mt-1">
            Rs. {amountNPR}
          </p>
        </div>

        <div className="px-6 py-5">{children}</div>

        {/* Cancel link */}
        <div className="px-6 pb-5 text-center">
          <button
            onClick={handleCancel}
            className="text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            Cancel payment
          </button>
        </div>

        {/* Test-mode hint */}
        <div className="bg-amber-50 border-t border-amber-100 px-4 py-3">
          <p className="text-xs text-amber-700 font-semibold text-center mb-1">
            🔧 Sandbox — use test credentials
          </p>
          <div className="text-xs text-amber-600 space-y-0.5 text-center">
            <p>Phone: <strong>9800000001</strong></p>
            <p>MPIN: <strong>1111</strong> &nbsp;·&nbsp; OTP: <strong>987654</strong></p>
          </div>
        </div>
      </div>
    </div>
  );

  if (step === "phone")
    return (
      <Card>
        <h2 className="text-base font-semibold text-gray-700 mb-4">
          Enter your Khalti registered mobile number
        </h2>
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              Mobile Number
            </label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-[#5C2D8E]">
              <span className="bg-gray-100 px-3 py-2.5 text-sm text-gray-500 border-r border-gray-300">
                +977
              </span>
              <input
                type="tel"
                maxLength={10}
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                placeholder="98XXXXXXXX"
                className="flex-1 px-3 py-2.5 text-sm outline-none"
                required
                autoFocus
              />
            </div>
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#5C2D8E] hover:bg-[#4a2272] text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Continue
          </button>
        </form>
      </Card>
    );

  // Step 2 MPIN 
  if (step === "mpin")
    return (
      <Card>
        <h2 className="text-base font-semibold text-gray-700 mb-1">
          Enter your MPIN
        </h2>
        <p className="text-xs text-gray-400 mb-4">for {phone}</p>
        <form onSubmit={handleMpinSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              MPIN
            </label>
            <input
              type="password"
              maxLength={6}
              value={mpin}
              onChange={(e) => setMpin(e.target.value.replace(/\D/g, ""))}
              placeholder="Enter MPIN"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#5C2D8E] tracking-widest"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            className="w-full bg-[#5C2D8E] hover:bg-[#4a2272] text-white font-semibold py-2.5 rounded-lg transition-colors"
          >
            Proceed
          </button>
          <button
            type="button"
            onClick={() => { setStep("phone"); setError(""); setMpin(""); }}
            className="w-full text-sm text-gray-400 hover:text-gray-600"
          >
            ← Change number
          </button>
        </form>
      </Card>
    );

  // ── Step 3 — OTP ──────────────────────────────────────────────────────────
  if (step === "otp")
    return (
      <Card>
        <h2 className="text-base font-semibold text-gray-700 mb-1">
          Enter OTP
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          An OTP has been sent to <strong>+977 {phone}</strong>
        </p>
        <form onSubmit={handleOtpSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">
              One-Time Password
            </label>
            <input
              type="text"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="6-digit OTP"
              className="w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#5C2D8E] tracking-widest text-center text-lg"
              required
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#5C2D8E] hover:bg-[#4a2272] disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Processing…
              </>
            ) : (
              `Pay Rs. ${amountNPR}`
            )}
          </button>
        </form>
      </Card>
    );

  return null;
}
