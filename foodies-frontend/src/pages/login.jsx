import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  X,
  CheckCircle,
  Home,
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import logo from "../assets/logo.png";
import {
  loginUser,
  forgotPassword,
  verifyResetOTP,
  resetPassword,
  resendResetOTP,
} from "../services/authService";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState("");

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetStep, setResetStep] = useState(1);
  const [resetEmail, setResetEmail] = useState("");
  const [resetEmailError, setResetEmailError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verifiedOtp, setVerifiedOtp] = useState(""); // store verified OTP for reset step
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordErrors, setPasswordErrors] = useState({});
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    if (formError) setFormError("");
  };

  // Validation
  const validateForm = () => {
    const newErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = "Email address is required";
    } else if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        formData.email.trim(),
      )
    ) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  setFormError("");

  try {
    const data = await loginUser({
      email: formData.email.trim().toLowerCase(),
      password: formData.password,
      rememberMe: formData.rememberMe,
    });

    // No more refreshToken in localStorage
    localStorage.setItem("token", data.data.accessToken);
    localStorage.setItem("user", JSON.stringify(data.data.user));
    localStorage.setItem("rememberMe", formData.rememberMe.toString());
    sessionStorage.setItem("sessionActive", "true");

    navigate(data.data.redirectTo);
  } catch (error) {
    setFormError(error.message || "Login failed. Please try again.");
  } finally {
    setLoading(false);
  }
};
  // Start resend timer
  const startResendTimer = () => {
    setResendTimer(60);
    const interval = setInterval(() => {
      setResendTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Handle forgot password - Send OTP
  const handleSendOTP = async (e) => {
    e.preventDefault();
    setResetEmailError("");
    setModalError("");

    if (!resetEmail.trim()) {
      setResetEmailError("Email address is required");
      return;
    }
    if (
      !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
        resetEmail.trim(),
      )
    ) {
      setResetEmailError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await forgotPassword({ email: resetEmail.trim().toLowerCase() });
      setResetStep(2);
      startResendTimer();
      setModalSuccess("Reset code sent to your email");
      setTimeout(() => setModalSuccess(""), 3000);
    } catch (error) {
      setModalError(
        error.message || "Failed to send reset code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input
  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    while (newOtp.length < 6) newOtp.push("");
    setOtp(newOtp);

    const lastInput = document.getElementById(`reset-otp-5`);
    if (lastInput) lastInput.focus();
  };

  // Handle OTP backspace
  const handleOtpKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setModalError("");

    const otpValue = otp.join("");
    if (otpValue.length !== 6) {
      setModalError("Please enter the complete 6-digit code");
      return;
    }

    setLoading(true);

    try {
      await verifyResetOTP({
        email: resetEmail.trim().toLowerCase(),
        otp: otpValue,
      });

      setVerifiedOtp(otpValue); // store for reset step
      setResetStep(3);
      setModalError("");
    } catch (error) {
      setModalError(error.message || "Invalid OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;

    setLoading(true);
    setModalError("");

    try {
      await resendResetOTP({ email: resetEmail.trim().toLowerCase() });
      setOtp(["", "", "", "", "", ""]);
      startResendTimer();
      setModalSuccess("Reset code resent successfully");
      setTimeout(() => setModalSuccess(""), 3000);
    } catch (error) {
      setModalError(
        error.message || "Failed to resend code. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Validate new password
  const validateNewPassword = () => {
    const newErrors = {};

    if (!newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])/.test(newPassword)) {
      newErrors.newPassword = "Password must contain a lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(newPassword)) {
      newErrors.newPassword = "Password must contain an uppercase letter";
    } else if (!/(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = "Password must contain a number";
    } else if (!/(?=.*[@$!%*?&])/.test(newPassword)) {
      newErrors.newPassword =
        "Password must contain a special character (@$!%*?&)";
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setModalError("");

    if (!validateNewPassword()) return;

    setLoading(true);

    try {
      await resetPassword({
        email: resetEmail.trim().toLowerCase(),
        otp: verifiedOtp,
        newPassword,
      });

      setModalSuccess("Password reset successfully! You can now login.");
      setTimeout(() => {
        closeForgotPasswordModal();
      }, 2000);
    } catch (error) {
      setModalError(
        error.message || "Password reset failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Close modal and reset all states
  const closeForgotPasswordModal = () => {
    setShowForgotPassword(false);
    setResetStep(1);
    setResetEmail("");
    setResetEmailError("");
    setOtp(["", "", "", "", "", ""]);
    setVerifiedOtp("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordErrors({});
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    setResendTimer(0);
    setModalError("");
    setModalSuccess("");
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100 via-red-50 to-yellow-100"></div>

      {/* Food Icons Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 text-6xl animate-float">🍕</div>
        <div className="absolute top-20 right-20 text-5xl animate-float-delay-1">
          🍔
        </div>
        <div className="absolute bottom-32 left-20 text-7xl animate-float-delay-2">
          🍜
        </div>
        <div className="absolute bottom-20 right-32 text-6xl animate-float-delay-3">
          🍰
        </div>
        <div className="absolute top-1/3 left-1/4 text-5xl animate-float-delay-4">
          🥗
        </div>
        <div className="absolute top-2/3 right-1/4 text-6xl animate-float">
          🍱
        </div>
        <div className="absolute top-1/2 left-10 text-5xl animate-float-delay-1">
          🌮
        </div>
        <div className="absolute bottom-1/3 right-10 text-7xl animate-float-delay-2">
          🍣
        </div>
        <div className="absolute top-40 left-1/3 text-4xl animate-float-delay-3">
          🥘
        </div>
        <div className="absolute bottom-40 right-1/3 text-5xl animate-float-delay-4">
          🍝
        </div>
      </div>

      {/* Gradient Overlay Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-orange-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-red-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-4000"></div>
      </div>

      {/* Home Button - Top Left */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        className="absolute top-6 left-6 z-20"
      >
        <Link to="/">
          <motion.div
            whileHover={{ scale: 1.2, rotate: -10 }}
            whileTap={{ scale: 0.9 }}
            className="relative group"
          >
            {/* Glow Ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-orange-200 to-red-200 rounded-full blur-md"
            />
            {/* Button */}
            <div className="relative bg-white/80 backdrop-blur-sm text-orange-500 p-3 rounded-full shadow-md border-2 border-orange-200 hover:border-orange-300 transition-colors duration-300">
              <Home className="w-5 h-5" />
            </div>
            {/* Tooltip */}
            <motion.div
              initial={{ opacity: 0, x: -5 }}
              whileHover={{ opacity: 1, x: 0 }}
              className="absolute left-14 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm text-orange-600 text-xs font-semibold px-3 py-1.5 rounded-lg whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-md border border-orange-100"
            >
              Go Home
              {/* Tooltip Arrow */}
              <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 border-4 border-transparent border-r-white" />
            </motion.div>
          </motion.div>
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-sm relative z-10"
      >
        {/* Logo and Title */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="flex justify-center mb-4"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-400 to-red-500 rounded-full blur-lg opacity-50"></div>
              <img
                src={logo}
                alt="Foodies Logo"
                className="w-20 h-20 relative z-10 rounded-full shadow-2xl object-cover"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-2">
              <span className="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
                Foodies
              </span>
            </h1>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
              Welcome Back
            </h2>
            <p className="text-gray-600 text-sm">
              Login to continue to your account
            </p>
          </motion.div>
        </div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-6 border border-white/20"
        >
          {/* Global Form Error */}
          <AnimatePresence>
            {formError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
              >
                <p className="text-red-600 text-sm text-center font-medium">
                  {formError}
                </p>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Email Address *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-orange-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter your email"
                  className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                    errors.email
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-orange-400 hover:border-orange-300"
                  }`}
                />
              </div>
              {errors.email && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs mt-1.5 ml-1"
                >
                  {errors.email}
                </motion.p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Password *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-orange-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Enter your password"
                  className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                    errors.password
                      ? "border-red-400 focus:border-red-500 bg-red-50"
                      : "border-gray-200 focus:border-orange-400 hover:border-orange-300"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                  )}
                </button>
              </div>
              {errors.password && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-600 text-xs mt-1.5 ml-1"
                >
                  {errors.password}
                </motion.p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="rememberMe"
                  name="rememberMe"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded cursor-pointer"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700 cursor-pointer"
                >
                  Remember me
                </label>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                className="text-sm font-semibold text-orange-600 hover:text-red-600 transition-colors"
              >
                Forgot Password?
              </button>
            </div>

            {/* Submit Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 text-lg mt-4"
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
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
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Logging in...</span>
                </>
              ) : (
                <>
                  <span>Login</span>
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </form>

          {/* Divider */}
          <div className="mt-6 mb-5">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500 font-medium">
                  Don't have an account?
                </span>
              </div>
            </div>
          </div>

          {/* Signup Link */}
          <motion.div whileHover={{ scale: 1.02 }} className="text-center">
            <Link
              to="/signup"
              className="inline-block px-6 py-3 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 font-bold rounded-xl hover:from-orange-200 hover:to-red-200 transition-all duration-300"
            >
              Create New Account
            </Link>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Forgot Password Modal */}
      <AnimatePresence>
        {showForgotPassword && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeForgotPasswordModal}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden"
            >
              {/* Modal Header */}
              <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5 relative">
                <button
                  onClick={closeForgotPasswordModal}
                  className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
                <h3 className="text-xl font-bold text-white">
                  {resetStep === 1 && "Reset Password"}
                  {resetStep === 2 && "Verify OTP"}
                  {resetStep === 3 && "Set New Password"}
                </h3>
                <p className="text-white/90 text-xs mt-1">
                  {resetStep === 1 && "We'll send you a verification code"}
                  {resetStep === 2 && `Code sent to ${resetEmail}`}
                  {resetStep === 3 && "Create your new password"}
                </p>
              </div>

              {/* Modal Body */}
              <div className="p-5">
                {/* Modal Error */}
                <AnimatePresence>
                  {modalError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
                    >
                      <p className="text-red-600 text-xs text-center font-medium">
                        {modalError}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Modal Success */}
                <AnimatePresence>
                  {modalSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"
                    >
                      <p className="text-green-600 text-xs text-center font-medium">
                        {modalSuccess}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {/* Step 1: Email Input */}
                  {resetStep === 1 && (
                    <motion.form
                      key="email-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleSendOTP}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Mail className="h-5 w-5 text-orange-400" />
                          </div>
                          <input
                            type="email"
                            value={resetEmail}
                            onChange={(e) => {
                              setResetEmail(e.target.value);
                              if (resetEmailError) setResetEmailError("");
                              if (modalError) setModalError("");
                            }}
                            placeholder="Enter your email"
                            className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                              resetEmailError
                                ? "border-red-400 focus:border-red-500 bg-red-50"
                                : "border-gray-200 focus:border-orange-400 hover:border-orange-300"
                            }`}
                          />
                        </div>
                        {resetEmailError && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-xs mt-1.5 ml-1"
                          >
                            {resetEmailError}
                          </motion.p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Sending...</span>
                          </>
                        ) : (
                          <span>Send OTP</span>
                        )}
                      </motion.button>
                    </motion.form>
                  )}

                  {/* Step 2: OTP Verification */}
                  {resetStep === 2 && (
                    <motion.form
                      key="otp-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleVerifyOTP}
                      className="space-y-5"
                    >
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-3 text-center">
                          Enter 6-Digit Code
                        </label>
                        <div className="flex justify-center space-x-2">
                          {otp.map((digit, index) => (
                            <input
                              key={index}
                              id={`reset-otp-${index}`}
                              type="text"
                              inputMode="numeric"
                              maxLength="1"
                              value={digit}
                              onChange={(e) =>
                                handleOtpChange(index, e.target.value)
                              }
                              onKeyDown={(e) => handleOtpKeyDown(index, e)}
                              onPaste={index === 0 ? handleOtpPaste : undefined}
                              className="w-10 h-12 text-center text-xl font-bold border-2 border-gray-200 rounded-lg focus:border-orange-500 focus:outline-none transition-all hover:border-orange-300"
                            />
                          ))}
                        </div>
                      </div>

                      {/* Resend OTP */}
                      <div className="text-center">
                        {resendTimer > 0 ? (
                          <p className="text-xs text-gray-600">
                            Resend OTP in{" "}
                            <span className="font-bold text-orange-600">
                              {resendTimer}s
                            </span>
                          </p>
                        ) : (
                          <button
                            type="button"
                            onClick={handleResendOtp}
                            disabled={loading}
                            className="text-xs text-orange-600 hover:text-red-600 font-semibold transition-colors disabled:opacity-50"
                          >
                            Resend OTP
                          </button>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading || otp.join("").length !== 6}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Verifying...</span>
                          </>
                        ) : (
                          <span>Verify OTP</span>
                        )}
                      </motion.button>

                      <button
                        type="button"
                        onClick={() => {
                          setResetStep(1);
                          setOtp(["", "", "", "", "", ""]);
                          setModalError("");
                        }}
                        className="w-full text-gray-600 hover:text-gray-800 font-semibold transition-colors text-sm"
                      >
                        ← Back to email
                      </button>
                    </motion.form>
                  )}

                  {/* Step 3: New Password */}
                  {resetStep === 3 && (
                    <motion.form
                      key="password-step"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      onSubmit={handleResetPassword}
                      className="space-y-4"
                    >
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-orange-400" />
                          </div>
                          <input
                            type={showNewPassword ? "text" : "password"}
                            value={newPassword}
                            onChange={(e) => {
                              setNewPassword(e.target.value);
                              if (passwordErrors.newPassword) {
                                setPasswordErrors((prev) => ({
                                  ...prev,
                                  newPassword: "",
                                }));
                              }
                            }}
                            placeholder="Enter new password"
                            className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                              passwordErrors.newPassword
                                ? "border-red-400 focus:border-red-500 bg-red-50"
                                : "border-gray-200 focus:border-orange-400 hover:border-orange-300"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          >
                            {showNewPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.newPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-xs mt-1.5 ml-1"
                          >
                            {passwordErrors.newPassword}
                          </motion.p>
                        )}
                        <p className="text-xs text-gray-500 mt-1 ml-1">
                          8+ chars with uppercase, lowercase, number & special
                          char
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Confirm Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Lock className="h-5 w-5 text-orange-400" />
                          </div>
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => {
                              setConfirmPassword(e.target.value);
                              if (passwordErrors.confirmPassword) {
                                setPasswordErrors((prev) => ({
                                  ...prev,
                                  confirmPassword: "",
                                }));
                              }
                            }}
                            placeholder="Confirm new password"
                            className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all ${
                              passwordErrors.confirmPassword
                                ? "border-red-400 focus:border-red-500 bg-red-50"
                                : "border-gray-200 focus:border-orange-400 hover:border-orange-300"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute inset-y-0 right-0 pr-4 flex items-center"
                          >
                            {showConfirmPassword ? (
                              <EyeOff className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                            ) : (
                              <Eye className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                            )}
                          </button>
                        </div>
                        {passwordErrors.confirmPassword && (
                          <motion.p
                            initial={{ opacity: 0, y: -5 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-red-600 text-xs mt-1.5 ml-1"
                          >
                            {passwordErrors.confirmPassword}
                          </motion.p>
                        )}
                      </div>

                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                      >
                        {loading ? (
                          <>
                            <svg
                              className="animate-spin h-5 w-5 text-white"
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
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                            <span>Resetting...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Reset Password</span>
                          </>
                        )}
                      </motion.button>
                    </motion.form>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animations CSS */}
      <style jsx>{`
        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.05);
          }
        }
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-20px) rotate(5deg);
          }
        }
        .animate-blob {
          animation: blob 7s infinite;
        }
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        .animate-float-delay-1 {
          animation: float 7s ease-in-out infinite;
          animation-delay: 1s;
        }
        .animate-float-delay-2 {
          animation: float 8s ease-in-out infinite;
          animation-delay: 2s;
        }
        .animate-float-delay-3 {
          animation: float 6.5s ease-in-out infinite;
          animation-delay: 3s;
        }
        .animate-float-delay-4 {
          animation: float 7.5s ease-in-out infinite;
          animation-delay: 4s;
        }
      `}</style>
    </div>
  );
};

export default Login;
