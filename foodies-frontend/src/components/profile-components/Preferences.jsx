import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Smartphone, Mail, Monitor, CheckCircle, AlertCircle, ShieldAlert } from "lucide-react";
import { updatePreferences } from "../../services/authService";

// ── Toggle Switch ──────────────────────────────────────────────────────────────
const Toggle = ({ checked, disabled, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={onChange}
    className={`relative inline-flex h-7 w-12 flex-shrink-0 items-center rounded-full transition-colors duration-300 focus:outline-none ${
      disabled
        ? "bg-gray-200 cursor-not-allowed"
        : checked
        ? "bg-gradient-to-r from-orange-500 to-red-600 cursor-pointer"
        : "bg-gray-300 cursor-pointer"
    }`}
  >
    <motion.span
      layout
      transition={{ type: "spring", stiffness: 500, damping: 30 }}
      className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md ${
        checked ? "translate-x-6" : "translate-x-1"
      }`}
    />
  </button>
);

// ── Notification Row ───────────────────────────────────────────────────────────
const NotificationRow = ({ icon: Icon, title, description, checked, disabled, disabledHint, onChange }) => (
  <div className="flex items-center justify-between gap-4 bg-white/70 border border-gray-100 rounded-2xl px-4 py-3.5">
    <div className="flex items-center space-x-3 min-w-0">
      <div className={`p-2 rounded-xl shadow-sm flex-shrink-0 ${disabled ? "bg-gray-300" : "bg-gradient-to-br from-orange-400 to-red-500"}`}>
        <Icon className="w-4 h-4 text-white" />
      </div>
      <div className="min-w-0">
        <p className="text-sm font-bold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500">{description}</p>
        {disabled && disabledHint && (
          <p className="flex items-center gap-1 text-xs text-orange-600 font-semibold mt-1">
            <ShieldAlert className="w-3 h-3" />
            {disabledHint}
          </p>
        )}
      </div>
    </div>
    <Toggle checked={checked} disabled={disabled} onChange={onChange} />
  </div>
);

const Preferences = ({ user, setUser }) => {
  const [preferences, setPreferences] = useState({
    mobile_notifications: !!user.mobile_notifications,
    email_notifications: user.email_notifications !== false,
    browser_notifications: user.browser_notifications !== false,
  });
  const [savingKey, setSavingKey] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const isMobileVerified = !!user.is_mobile_verified;

  const persist = async (key, value) => {
    const next = { ...preferences, [key]: value };
    setPreferences(next);
    setSavingKey(key);
    setError("");
    setSuccess("");

    try {
      const data = await updatePreferences(next);
      if (data?.data?.user) {
        setUser((prev) => ({ ...prev, ...data.data.user }));
      }
      setSuccess("Preferences saved");
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setPreferences((prev) => ({ ...prev, [key]: !value }));
      setError(err.message || "Failed to update preference. Please try again.");
    } finally {
      setSavingKey(null);
    }
  };

  const handleToggle = (key) => {
    if (key === "mobile_notifications" && !isMobileVerified) return; // can't click
    persist(key, !preferences[key]);
  };

  useEffect(() => {
  if (!user.is_mobile_verified) {
    setPreferences(prev => ({ ...prev, mobile_notifications: false }));
  }
}, [user.is_mobile_verified]);

  return (
    <div className="bg-gradient-to-br from-orange-50 via-white to-red-50 border-2 border-orange-100 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-sm">
          <Bell className="w-4 h-4 text-white" />
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">Notification Preferences</h3>
          <p className="text-xs text-gray-500">Choose how you'd like to hear from us</p>
        </div>
      </div>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 p-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
            <p className="text-sm text-green-700 font-medium">{success}</p>
          </motion.div>
        )}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
            <p className="text-sm text-red-600 font-medium">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-3">
        <NotificationRow
          icon={Smartphone}
          title="Mobile Notifications"
          description="SMS alerts about your orders"
          checked={isMobileVerified && preferences.mobile_notifications}
          disabled={!isMobileVerified || savingKey === "mobile_notifications"}
          disabledHint={!isMobileVerified ? "Verify your mobile number to enable this" : null}
          onChange={() => handleToggle("mobile_notifications")}
        />
        <NotificationRow
          icon={Mail}
          title="Email Notifications"
          description="Order updates and offers via email"
          checked={preferences.email_notifications}
          disabled={savingKey === "email_notifications"}
          onChange={() => handleToggle("email_notifications")}
        />
        <NotificationRow
          icon={Monitor}
          title="Browser Notifications"
          description="Real-time alerts in your browser"
          checked={preferences.browser_notifications}
          disabled={savingKey === "browser_notifications"}
          onChange={() => handleToggle("browser_notifications")}
        />
      </div>
    </div>
  );
};

export default Preferences;