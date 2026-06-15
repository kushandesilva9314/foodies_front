import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  User,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Save,
  X,
  CheckCircle,
  AlertCircle,
  LogOut,
  Shield,
} from "lucide-react";

// ── Load current user from localStorage (set on login/refresh/profile update) ──
const getStoredUser = () => {
  try {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

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

// ── Sign Out (All Devices) Confirm Modal ──────────────────────────────────────
const LogoutModal = ({ isOpen, onClose, onConfirm, loading }) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-600 p-5 relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-full">
                <LogOut className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-bold text-white">
                Sign Out from All Devices
              </h3>
            </div>
          </div>
          <div className="p-6">
            <p className="text-gray-600 text-sm mb-6">
              This will sign you out everywhere — including this device. You'll
              need to log in again on every device to access your account.
            </p>
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
              >
                Stay
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-semibold text-sm shadow-md transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? (
                  <>
                    <Spinner />
                    <span>Signing out...</span>
                  </>
                ) : (
                  <span>Sign Out</span>
                )}
              </motion.button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ── Main Component ────────────────────────────────────────────────────────────
const AccountSettings = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(
    getStoredUser() || {
      id: "",
      name: "",
      email: "",
      mobile: "",
      profile_photo: null,
      role: "customer",
      is_verified: true,
      is_mobile_verified: false,
    },
  );

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user.name,
    mobile: user.mobile,
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoRemoved, setPhotoRemoved] = useState(false);
  const [photoPreview, setPhotoPreview] = useState(user.profile_photo);
  const [profileErrors, setProfileErrors] = useState({});
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState("");
  const [profileError, setProfileError] = useState("");

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Logout modal
  const [logoutModal, setLogoutModal] = useState(false);
  const [logoutLoading, setLogoutLoading] = useState(false);

  // Get initials
  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Scroll to the mobile verification section
  const handleVerifyNowClick = () => {
    const target = document.getElementById("mobile-verification-section");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Handle profile photo change
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file && ["image/png", "image/jpeg", "image/jpg"].includes(file.type)) {
      setProfilePhoto(file);
      setPhotoRemoved(false);
      const reader = new FileReader();
      reader.onloadend = () => setPhotoPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Remove photo
  const handleRemovePhoto = () => {
    setProfilePhoto(null);
    setPhotoPreview(null);
    setPhotoRemoved(true);
  };

  // Validate profile form
  const validateProfile = () => {
    const errors = {};
    if (!profileForm.name.trim()) {
      errors.name = "Full name is required";
    } else if (profileForm.name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters";
    } else if (profileForm.name.trim().length > 50) {
      errors.name = "Name must not exceed 50 characters";
    } else if (!/^[a-zA-Z\s]+$/.test(profileForm.name.trim())) {
      errors.name = "Name can only contain letters and spaces";
    }

    if (!profileForm.mobile.trim()) {
      errors.mobile = "Mobile number is required";
    } else if (!/^[0-9]{10}$/.test(profileForm.mobile.replace(/\s/g, ""))) {
      errors.mobile = "Mobile number must be exactly 10 digits";
    } else if (!/^[0789]/.test(profileForm.mobile.replace(/\s/g, ""))) {
      errors.mobile = "Mobile number must start with 0, 7, 8, or 9";
    }

    setProfileErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle profile submit
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    if (!validateProfile()) return;
    setProfileLoading(true);
    setProfileError("");
    setProfileSuccess("");

    try {
      const { updateProfile } = await import("../../services/authService");

      const result = await updateProfile({
        name: profileForm.name.trim(),
        mobile: profileForm.mobile.replace(/\s/g, ""),
        profilePhoto, // File object, or null if unchanged
        removePhoto: photoRemoved, // true if user removed an existing photo
      });

      const updatedUser = result?.data?.user;
      if (updatedUser) {
        setUser(updatedUser);
        setProfileForm({ name: updatedUser.name, mobile: updatedUser.mobile });
        setPhotoPreview(updatedUser.profile_photo);
      }

      setProfilePhoto(null);
      setPhotoRemoved(false);
      setProfileSuccess(result?.message || "Profile updated successfully!");
    } catch (error) {
      setProfileError(
        error.message || "Failed to update profile. Please try again.",
      );
    } finally {
      setProfileLoading(false);
      setTimeout(() => {
        setProfileSuccess("");
        setProfileError("");
      }, 4000);
    }
  };

  // Validate password form
  const validatePassword = () => {
    const errors = {};
    if (!passwordForm.currentPassword) {
      errors.currentPassword = "Current password is required";
    }
    if (!passwordForm.newPassword) {
      errors.newPassword = "New password is required";
    } else if (passwordForm.newPassword.length < 8) {
      errors.newPassword = "Password must be at least 8 characters";
    } else if (passwordForm.newPassword.length > 128) {
      errors.newPassword = "Password must not exceed 128 characters";
    } else if (!/(?=.*[a-z])/.test(passwordForm.newPassword)) {
      errors.newPassword = "Password must contain a lowercase letter";
    } else if (!/(?=.*[A-Z])/.test(passwordForm.newPassword)) {
      errors.newPassword = "Password must contain an uppercase letter";
    } else if (!/(?=.*\d)/.test(passwordForm.newPassword)) {
      errors.newPassword = "Password must contain a number";
    } else if (!/(?=.*[@$!%*?&])/.test(passwordForm.newPassword)) {
      errors.newPassword =
        "Password must contain a special character (@$!%*?&)";
    }
    if (!passwordForm.confirmPassword) {
      errors.confirmPassword = "Please confirm your new password";
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmPassword = "Passwords do not match";
    }
    setPasswordErrors(errors);
    return Object.keys(errors).length === 0;
  };
  // Handle password submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (!validatePassword()) return;
    setPasswordLoading(true);
    setPasswordError("");
    setPasswordSuccess("");

    try {
      const { changePassword } = await import("../../services/authService");

      const result = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setPasswordSuccess(result?.message || "Password changed successfully!");
    } catch (error) {
      setPasswordError(
        error.message || "Failed to change password. Please try again.",
      );
      setPasswordForm((prev) => ({ ...prev, currentPassword: "" }));
    } finally {
      setPasswordLoading(false);
      setTimeout(() => {
        setPasswordSuccess("");
        setPasswordError("");
      }, 4000);
    }
  };
  // Handle "Sign Out from All Devices"
  const handleLogoutConfirm = async () => {
    setLogoutLoading(true);
    try {
      const { logoutAllDevices } = await import("../../services/authService");
      await logoutAllDevices();
    } catch (error) {
      console.error("Sign out from all devices error:", error);
    } finally {
      setLogoutLoading(false);
      setLogoutModal(false);
      navigate("/login");
    }
  };

  return (
    <div className="space-y-8">
      {/* Logout Modal */}
      <LogoutModal
        isOpen={logoutModal}
        onClose={() => setLogoutModal(false)}
        onConfirm={handleLogoutConfirm}
        loading={logoutLoading}
      />

      {/* ── Section Header ── */}
      <div>
        <h2 className="text-xl sm:text-2xl font-bold text-gray-800">
          Account Settings
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Manage your profile information and account security
        </p>
      </div>

      {/* ── Profile Information ── */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Subsection Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-sm">
            <User className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Profile Information
            </h3>
            <p className="text-xs text-gray-500">
              Update your name, mobile and profile photo
            </p>
          </div>
        </div>

        {/* Success / Error */}
        <AnimatePresence>
          {profileSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl"
            >
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">
                {profileSuccess}
              </p>
            </motion.div>
          )}
          {profileError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">{profileError}</p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleProfileSubmit} className="space-y-5">
          {/* Profile Photo */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="relative mx-auto sm:mx-0 flex-shrink-0">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Profile"
                  className="h-24 w-24 rounded-full object-cover border-4 border-orange-300 shadow-md"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center border-4 border-orange-300 shadow-md">
                  <span className="text-white text-2xl font-bold">
                    {getInitials(profileForm.name)}
                  </span>
                </div>
              )}
              {/* Camera button */}
              <label className="absolute bottom-0 right-0 p-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-full cursor-pointer shadow-md hover:shadow-lg transition-all border-2 border-white">
                <Camera className="w-3.5 h-3.5 text-white" />
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>
            </div>

            <div className="text-center sm:text-left space-y-1">
              <p className="text-sm font-semibold text-gray-700">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
              <div className="flex flex-wrap justify-center sm:justify-start gap-2 mt-2">
                <label className="text-xs font-semibold text-orange-600 hover:text-orange-700 cursor-pointer border border-orange-200 hover:border-orange-300 hover:bg-orange-50 px-3 py-1 rounded-full transition-all">
                  Change Photo
                  <input
                    type="file"
                    accept="image/png, image/jpeg, image/jpg"
                    onChange={handlePhotoChange}
                    className="hidden"
                  />
                </label>
                {photoPreview && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="text-xs font-semibold text-red-500 hover:text-red-700 border border-red-200 hover:border-red-300 hover:bg-red-50 px-3 py-1 rounded-full transition-all"
                  >
                    Remove Photo
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Name Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Full Name *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-orange-400" />
              </div>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => {
                  setProfileForm((prev) => ({ ...prev, name: e.target.value }));
                  if (profileErrors.name)
                    setProfileErrors((prev) => ({ ...prev, name: "" }));
                }}
                placeholder="Enter your full name"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                  profileErrors.name
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-orange-400 hover:border-orange-300 bg-white"
                }`}
              />
            </div>
            {profileErrors.name && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xs mt-1.5 ml-1"
              >
                {profileErrors.name}
              </motion.p>
            )}
          </div>

          {/* Email — Read Only */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Email Address
              <span className="ml-2 text-xs font-normal text-gray-400">
                (cannot be changed)
              </span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Shield className="h-5 w-5 text-gray-300" />
              </div>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full pl-11 pr-4 py-3 border-2 border-gray-100 rounded-xl bg-gray-50 text-gray-400 text-sm cursor-not-allowed"
              />
            </div>
            <p className="text-xs text-gray-400 mt-1.5 ml-1">
              Email address is locked for security purposes
            </p>
          </div>

          {/* Mobile Field */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Mobile Number *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-orange-400" />
              </div>
              <input
                type="tel"
                value={profileForm.mobile}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setProfileForm((prev) => ({ ...prev, mobile: value }));
                  if (profileErrors.mobile)
                    setProfileErrors((prev) => ({ ...prev, mobile: "" }));
                }}
                placeholder="07XXXXXXXX"
                maxLength="10"
                className={`w-full pl-11 pr-4 py-3 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                  profileErrors.mobile
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-orange-400 hover:border-orange-300 bg-white"
                }`}
              />
            </div>
            {profileErrors.mobile && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xs mt-1.5 ml-1"
              >
                {profileErrors.mobile}
              </motion.p>
            )}
            {/* Mobile verification badge */}
            <div className="mt-2 flex items-center space-x-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  user.is_mobile_verified
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-600"
                }`}
              >
                {user.is_mobile_verified
                  ? "✓ Mobile Verified"
                  : "⚠ Mobile Not Verified"}
              </span>
              {!user.is_mobile_verified && (
                <button
                  type="button"
                  onClick={handleVerifyNowClick}
                  className="text-xs text-orange-500 hover:text-orange-700 font-semibold underline transition-colors"
                >
                  Verify Now
                </button>
              )}
            </div>
          </div>

          {/* Save Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={profileLoading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {profileLoading ? (
              <>
                <Spinner />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Save Changes</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* ── Change Password ── */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-gray-50 border-2 border-gray-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-6">
        {/* Subsection Header */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-700 rounded-xl shadow-sm">
            <Lock className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">
              Change Password
            </h3>
            <p className="text-xs text-gray-500">
              Update your password to keep your account secure
            </p>
          </div>
        </div>

        {/* Success / Error */}
        <AnimatePresence>
          {passwordSuccess && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl"
            >
              <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">
                {passwordSuccess}
              </p>
            </motion.div>
          )}
          {passwordError && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl"
            >
              <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600 font-medium">
                {passwordError}
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handlePasswordSubmit} className="space-y-4">
          {/* Current Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({
                    ...prev,
                    currentPassword: e.target.value,
                  }));
                  if (passwordErrors.currentPassword)
                    setPasswordErrors((prev) => ({
                      ...prev,
                      currentPassword: "",
                    }));
                }}
                placeholder="Enter current password"
                className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                  passwordErrors.currentPassword
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-orange-400 hover:border-orange-300 bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-4 flex items-center"
              >
                {showCurrentPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-orange-500 transition-colors" />
                )}
              </button>
            </div>
            {passwordErrors.currentPassword && (
              <motion.p
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-600 text-xs mt-1.5 ml-1"
              >
                {passwordErrors.currentPassword}
              </motion.p>
            )}
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({
                    ...prev,
                    newPassword: e.target.value,
                  }));
                  if (passwordErrors.newPassword)
                    setPasswordErrors((prev) => ({ ...prev, newPassword: "" }));
                }}
                placeholder="Enter new password"
                className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                  passwordErrors.newPassword
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-orange-400 hover:border-orange-300 bg-white"
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
            <p className="text-xs text-gray-400 mt-1.5 ml-1">
              8+ characters with uppercase, lowercase, number & special
              character
            </p>
          </div>

          {/* Confirm New Password */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">
              Confirm New Password *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => {
                  setPasswordForm((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value,
                  }));
                  if (passwordErrors.confirmPassword)
                    setPasswordErrors((prev) => ({
                      ...prev,
                      confirmPassword: "",
                    }));
                }}
                placeholder="Confirm new password"
                className={`w-full pl-11 pr-12 py-3 border-2 rounded-xl focus:outline-none transition-all text-sm ${
                  passwordErrors.confirmPassword
                    ? "border-red-400 focus:border-red-500 bg-red-50"
                    : "border-gray-200 focus:border-orange-400 hover:border-orange-300 bg-white"
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
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

          {/* Save Password Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={passwordLoading}
            className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-gray-800 hover:bg-gray-900 text-white px-8 py-3 rounded-xl font-bold shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {passwordLoading ? (
              <>
                <Spinner />
                <span>Updating...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>Update Password</span>
              </>
            )}
          </motion.button>
        </form>
      </div>

      {/* ── Sign Out from All Devices ── */}
      <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-100 rounded-3xl p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-sm">
              <LogOut className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-800">
                Sign Out from All Devices
              </h3>
              <p className="text-xs text-gray-500">
                End every active session, including this one
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setLogoutModal(true)}
            className="flex items-center justify-center space-x-2 bg-white border-2 border-orange-200 hover:border-orange-400 text-orange-600 hover:bg-orange-50 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Everywhere</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettings;
