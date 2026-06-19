import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Phone, ShieldCheck, ShieldAlert, Send } from "lucide-react";
import { RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { auth } from "../../config/firebase";
import { verifyMobileOtp } from "../../services/authService";

// ── Spinner ───────────────────────────────────────────────────────────────────
const Spinner = () => (
  <svg
    className="animate-spin h-4 w-4 text-white"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const MobileVerification = ({ mobile, isVerified, onVerified }) => {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [sendLoading, setSendLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [error, setError] = useState("");
  const confirmationResultRef = useRef(null);
  const recaptchaVerifierRef = useRef(null);

  // Resend countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Clean up reCAPTCHA when component unmounts
  useEffect(() => {
    return () => {
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    };
  }, []);

  // OTP input handlers
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      const next = document.getElementById(`mobile-otp-${index + 1}`);
      if (next) next.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prev = document.getElementById(`mobile-otp-${index - 1}`);
      if (prev) prev.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pasted)) return;
    const newOtp = pasted.split("");
    while (newOtp.length < 6) newOtp.push("");
    setOtp(newOtp);
    const last = document.getElementById("mobile-otp-5");
    if (last) last.focus();
  };

  // Convert stored 10-digit mobile to E.164 format for Firebase
  // e.g. "0771234567" → "+94771234567"  (Sri Lanka +94)
  // Change +94 to your country code if needed
  const toE164 = (num) => {
    if (!num) return "";
    const digits = num.replace(/\D/g, "");
    if (digits.startsWith("94") && digits.length === 11) return "+" + digits;
    if (digits.startsWith("0") && digits.length === 10)
      return "+94" + digits.slice(1);
    return "+" + digits; // fallback
  };

  // Send OTP via Firebase
  const handleSendOtp = async () => {
    setSendLoading(true);
    setError("");

    try {
      // Clear any previous reCAPTCHA instance
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }

      const verifier = new RecaptchaVerifier(auth, "recaptcha-container", {
        size: "invisible",
        callback: () => {},
        "error-callback": () => {},
      });
      recaptchaVerifierRef.current = verifier;
      await verifier.render();

      const phoneNumber = toE164(mobile);
      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        verifier,
      );
      confirmationResultRef.current = confirmationResult;

      setOtp(["", "", "", "", "", ""]);
      setShowOtpInput(true);
      setResendTimer(60);
    } catch (err) {
      console.error("Firebase send OTP error:", err);

      // Friendly error messages for common Firebase errors
      if (err.code === "auth/invalid-phone-number") {
        setError(
          "Invalid phone number format. Please update your mobile number in Account Settings.",
        );
      } else if (err.code === "auth/too-many-requests") {
        setError("Too many attempts. Please wait a few minutes and try again.");
      } else {
        setError("Failed to send verification code. Please try again.");
      }

      // Clean up failed reCAPTCHA
      if (recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current.clear();
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setSendLoading(false);
    }
  };

  // Verify OTP via Firebase, then confirm with our backend
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setError("Please enter the complete 6-digit code");
      return;
    }
    if (!confirmationResultRef.current) {
      setError("Session expired. Please click Verify Now again.");
      setShowOtpInput(false);
      return;
    }

    setVerifyLoading(true);
    setError("");

    try {
      // Step 1: Confirm the OTP with Firebase
      const result = await confirmationResultRef.current.confirm(otpValue);

      // Step 2: Get the Firebase ID token
      const firebaseToken = await result.user.getIdToken();

      // Step 3: Send it to our backend to set is_mobile_verified = true
      await verifyMobileOtp(firebaseToken);

      // Step 4: Update parent state + localStorage
      setShowOtpInput(false);
      confirmationResultRef.current = null;
      onVerified?.();
    } catch (err) {
      console.error("Firebase verify OTP error:", err);

      if (err.code === "auth/invalid-verification-code") {
        setError("Invalid code. Please check and try again.");
      } else if (err.code === "auth/code-expired") {
        setError("Code expired. Please request a new one.");
        setShowOtpInput(false);
        confirmationResultRef.current = null;
      } else {
        setError(err.message || "Verification failed. Please try again.");
      }
    } finally {
      setVerifyLoading(false);
    }
  };

  return (
    <div
      id="mobile-verification-section"
      className={`border-2 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5 transition-colors ${
        isVerified
          ? "bg-gradient-to-br from-green-50 via-white to-emerald-50 border-green-100"
          : "bg-gradient-to-br from-orange-50 via-white to-red-50 border-orange-100"
      }`}
    >
      {/* Invisible reCAPTCHA container — Firebase needs this in the DOM */}
      <div id="recaptcha-container"></div>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`p-2 rounded-xl shadow-sm ${
              isVerified
                ? "bg-gradient-to-br from-green-400 to-emerald-500"
                : "bg-gradient-to-br from-orange-400 to-red-500"
            }`}
          >
            <Phone className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Mobile Verification
            </h3>
            <p className="text-xs text-gray-500">
              Verify your mobile number to secure your account
            </p>
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${
            isVerified
              ? "bg-green-100 text-green-700"
              : "bg-orange-100 text-orange-600"
          }`}
        >
          {isVerified ? (
            <>
              <ShieldCheck className="w-3.5 h-3.5" /> Verified
            </>
          ) : (
            <>
              <ShieldAlert className="w-3.5 h-3.5" /> Not Verified
            </>
          )}
        </span>
      </div>

      {/* Current mobile number */}
      <div className="flex items-center justify-between flex-wrap gap-3 bg-white/70 border border-gray-100 rounded-2xl px-4 py-3">
        <div className="flex items-center space-x-3">
          <Phone className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-semibold text-gray-700">
            {mobile || "No number on file"}
          </span>
        </div>

        {!isVerified && !showOtpInput && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={handleSendOtp}
            disabled={sendLoading || !mobile}
            className="flex items-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-4 py-2 rounded-xl font-semibold text-xs shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sendLoading ? (
              <>
                <Spinner />
                <span>Sending...</span>
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                <span>Verify Now</span>
              </>
            )}
          </motion.button>
        )}
      </div>

      {/* Error */}
      {error && (
        <motion.p
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-red-600 text-xs ml-1"
        >
          {error}
        </motion.p>
      )}

      {/* OTP input — appears after "Verify Now" */}
      <AnimatePresence>
        {!isVerified && showOtpInput && (
          <motion.form
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            onSubmit={handleVerifyOtp}
            className="space-y-4 overflow-hidden"
          >
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                Enter the 6-digit code sent to {mobile}
              </label>
              <div className="flex justify-center space-x-2">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`mobile-otp-${index}`}
                    type="text"
                    inputMode="numeric"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    onPaste={index === 0 ? handleOtpPaste : undefined}
                    className="w-11 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all hover:border-orange-300"
                  />
                ))}
              </div>
            </div>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-gray-600">
                  Resend code in{" "}
                  <span className="font-bold text-orange-600">
                    {resendTimer}s
                  </span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={sendLoading}
                  className="text-xs text-orange-600 hover:text-red-600 font-semibold transition-colors disabled:opacity-50"
                >
                  Resend Code
                </button>
              )}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowOtpInput(false);
                  confirmationResultRef.current = null;
                }}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={verifyLoading || otp.join("").length !== 6}
                className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyLoading ? (
                  <>
                    <Spinner />
                    <span>Verifying...</span>
                  </>
                ) : (
                  <span>Verify Code</span>
                )}
              </motion.button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MobileVerification;
