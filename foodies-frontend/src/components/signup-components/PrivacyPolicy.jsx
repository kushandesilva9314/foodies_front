import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield } from "lucide-react";

const PrivacyPolicy = ({ isOpen, onClose }) => {
  const [hasReadAll, setHasReadAll] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setHasReadAll(false);
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  useEffect(() => {
    const handleEsc = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop - clientHeight < 10) {
      setHasReadAll(true);
    }
  };

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            zIndex: 9998,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "1rem",
          }}
        >
          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(92vw, 780px)",
              height: "90vh",
              display: "flex",
              flexDirection: "column",
              backgroundColor: "white",
              borderRadius: "1.5rem",
              boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
              overflow: "hidden",
              zIndex: 9999,
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-orange-100 bg-gradient-to-r from-orange-50 to-red-50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Privacy Policy</h2>
                  <p className="text-xs text-gray-500">Last updated: January 1, 2025</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-gray-500 hover:text-gray-800 hover:bg-orange-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content */}
            <div
              onScroll={handleScroll}
              className="overflow-y-auto flex-1 px-6 py-6 text-sm text-gray-700 leading-relaxed space-y-5"
            >
              <p className="text-gray-500 italic">
                Your privacy is important to us. This policy explains how Foodies collects, uses, and protects your personal information.
              </p>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">1. Information We Collect</h3>
                <p>We collect information you provide directly to us when you create an account, place orders, or contact support. This includes your name, email address, phone number, delivery address, and payment information. We also automatically collect certain information when you use our Service, such as your IP address, browser type, device identifiers, and usage data.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">2. How We Use Your Information</h3>
                <p>We use the information we collect to process and fulfill your orders, communicate with you about your account and orders, send promotional communications (with your consent), improve and personalize our Service, detect and prevent fraudulent transactions, and comply with legal obligations. We will never sell your personal data to third parties for their own marketing purposes.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">3. Sharing of Information</h3>
                <p>We may share your information with restaurant partners to fulfill your orders, delivery partners to complete deliveries, payment processors to handle transactions securely, and service providers who assist in our operations under strict confidentiality agreements. We may also disclose your information if required by law or to protect the rights and safety of Foodies and our users.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">4. Data Security</h3>
                <p>We implement industry-standard security measures to protect your personal information, including SSL encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure. While we strive to use commercially acceptable means to protect your data, we cannot guarantee absolute security.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">5. Cookies and Tracking</h3>
                <p>We use cookies and similar tracking technologies to enhance your experience on our platform, remember your preferences, analyze usage patterns, and deliver relevant advertisements. You can control cookie settings through your browser, but disabling cookies may affect certain features of the Service. By continuing to use our Service, you consent to our use of cookies.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">6. Data Retention</h3>
                <p>We retain your personal information for as long as your account is active or as needed to provide the Service. If you close your account, we will delete or anonymize your data within 90 days, except where we are required to retain it for legal, regulatory, or legitimate business purposes such as resolving disputes or enforcing agreements.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">7. Your Rights</h3>
                <p>You have the right to access, correct, or delete your personal information at any time through your account settings. You may also request a copy of your data, opt out of marketing communications, or restrict certain types of data processing. To exercise these rights, contact us at <span className="text-orange-600 font-semibold">privacy@foodies.lk</span>. We will respond to all requests within 30 days.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">8. Children's Privacy</h3>
                <p>Our Service is not directed to children under the age of 13. We do not knowingly collect personal information from children. If we become aware that a child under 13 has provided us with personal information, we will take steps to delete such information promptly.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">9. Third-Party Links</h3>
                <p>Our Service may contain links to third-party websites or services. We are not responsible for the privacy practices of those third parties. We encourage you to review the privacy policies of any third-party sites you visit. This Privacy Policy applies only to information collected by Foodies through our platform.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">10. Changes to This Policy</h3>
                <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by posting a notice on our platform or sending you an email. Your continued use of the Service after the effective date of the revised policy constitutes your acceptance of the changes.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">11. Contact Us</h3>
                <p>If you have any questions or concerns about this Privacy Policy, please reach out to us at <span className="text-orange-600 font-semibold">privacy@foodies.lk</span> or through our in-app support chat.</p>
              </section>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-orange-100 bg-gradient-to-r from-orange-50 to-red-50 shrink-0">
              {!hasReadAll && (
                <p className="text-center text-xs text-gray-400 mb-2">
                  Scroll to the bottom to continue ↓
                </p>
              )}
              <button
                onClick={onClose}
                disabled={!hasReadAll}
                className={`w-full py-2.5 rounded-xl font-bold shadow-md transition-all duration-300 ${
                  hasReadAll
                    ? "bg-gradient-to-r from-orange-500 to-red-600 text-white hover:shadow-lg cursor-pointer"
                    : "bg-gray-200 text-gray-400 cursor-not-allowed"
                }`}
              >
                {hasReadAll ? "Got It" : "Please read to the bottom ↓"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default PrivacyPolicy;