import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, X, AlertTriangle } from "lucide-react";
import { deleteAccount } from "../../services/authService";

// Get a key at https://www.google.com/recaptcha/admin — choose reCAPTCHA v2
// "Checkbox", add your domain(s) (localhost works fine for v2). Then add:
//   VITE_RECAPTCHA_SITE_KEY=your-site-key   → frontend .env
//   RECAPTCHA_SECRET_KEY=your-secret-key    → backend .env
const RECAPTCHA_SITE_KEY = import.meta.env.VITE_RECAPTCHA_SITE_KEY;

let recaptchaScriptPromise = null;
const loadRecaptchaScript = () => {
  if (window.grecaptcha && window.grecaptcha.render) return Promise.resolve();
  if (recaptchaScriptPromise) return recaptchaScriptPromise;

  recaptchaScriptPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[src*="recaptcha/api.js"]');
    if (existing) {
      existing.addEventListener("load", resolve);
      existing.addEventListener("error", reject);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://www.google.com/recaptcha/api.js";
    script.async = true;
    script.defer = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });

  return recaptchaScriptPromise;
};

const Spinner = () => (
  <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const DeleteAccountModal = ({ isOpen, onClose, onConfirm, loading, error }) => {
  const containerRef = useRef(null);
  const widgetIdRef = useRef(null);
  const [token, setToken] = useState(null);
  const [scriptError, setScriptError] = useState("");

  useEffect(() => {
    if (!isOpen || !RECAPTCHA_SITE_KEY) return;

    let cancelled = false;

    loadRecaptchaScript()
      .then(() => {
        if (cancelled || !containerRef.current || !window.grecaptcha) return;
        setToken(null);
        setScriptError("");
        // Defensive: clear before rendering, so re-opening the modal
        // doesn't trigger "reCAPTCHA has already been rendered"
        containerRef.current.innerHTML = "";
        widgetIdRef.current = window.grecaptcha.render(containerRef.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (responseToken) => setToken(responseToken),
          "expired-callback": () => setToken(null),
        });
      })
      .catch(() => {
        if (!cancelled) setScriptError("Couldn't load the captcha. Check your connection and try again.");
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return (
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
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-5 relative">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-full p-1.5 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-lg font-bold text-white">Delete Account</h3>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-gray-600 text-sm">
                This permanently deletes your account, profile, and all related
                data. <span className="font-semibold text-gray-800">This cannot be undone.</span>
              </p>

              {!RECAPTCHA_SITE_KEY ? (
                <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-xl p-3">
                  Missing <code>VITE_RECAPTCHA_SITE_KEY</code> in your frontend .env —
                  the captcha can't load until that's set. Restart the dev server after adding it.
                </p>
              ) : (
                <div className="flex justify-center" ref={containerRef} />
              )}

              {scriptError && <p className="text-red-600 text-xs text-center">{scriptError}</p>}
              {error && <p className="text-red-600 text-xs text-center">{error}</p>}

              <div className="flex gap-3 pt-1">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all disabled:opacity-50"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => onConfirm(token)}
                  disabled={loading || !token}
                  className="flex-1 flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 text-white py-2.5 rounded-xl font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <Spinner />
                      <span>Deleting...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 className="w-4 h-4" />
                      <span>Delete Forever</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DeleteAccount = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleConfirm = async (token) => {
    if (!token) {
      setError("Please complete the captcha first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      await deleteAccount(token);

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("rememberMe");
      sessionStorage.removeItem("sessionActive");

      navigate("/login");
    } catch (err) {
      setError(err.message || "Failed to delete account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-red-50 via-white to-red-50 border-2 border-red-100 rounded-3xl p-5 sm:p-6 shadow-sm">
      <DeleteAccountModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setError("");
        }}
        onConfirm={handleConfirm}
        loading={loading}
        error={error}
      />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-red-600 rounded-xl shadow-sm">
            <Trash2 className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-800">Delete Account</h3>
            <p className="text-xs text-gray-500">
              Permanently delete your account and all related data
            </p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowModal(true)}
          className="flex items-center justify-center space-x-2 bg-white border-2 border-red-200 hover:border-red-400 text-red-600 hover:bg-red-50 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          <Trash2 className="w-4 h-4" />
          <span>Delete My Account</span>
        </motion.button>
      </div>
    </div>
  );
};

export default DeleteAccount;