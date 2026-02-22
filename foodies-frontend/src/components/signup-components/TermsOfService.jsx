import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, FileText } from "lucide-react";

const TermsOfService = ({ isOpen, onClose }) => {
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
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-800">Terms of Service</h2>
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
                Please read these Terms of Service carefully before using the Foodies platform.
              </p>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">1. Acceptance of Terms</h3>
                <p>By accessing or using the Foodies application, website, or any related services (collectively, the "Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. These terms apply to all users, including browsers, customers, merchants, and contributors of content.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">2. Use of the Service</h3>
                <p>You agree to use the Service only for lawful purposes and in a manner that does not infringe the rights of others. You may not use the Service to transmit any unlawful, harmful, threatening, abusive, harassing, defamatory, or otherwise objectionable content. You must be at least 18 years old, or the legal age of majority in your jurisdiction, to use this Service.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">3. Account Registration</h3>
                <p>To access certain features of the Service, you must create an account. You agree to provide accurate, current, and complete information during registration and to update such information to keep it accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Notify us immediately of any unauthorized use of your account.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">4. Orders and Payments</h3>
                <p>When you place an order through Foodies, you agree to pay all applicable fees, including the cost of the food items, delivery charges, and any applicable taxes. All payments are processed securely through our payment partners. Prices are subject to change without notice. Once an order is placed and confirmed, cancellations may not be possible depending on the preparation status.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">5. Delivery Policy</h3>
                <p>Delivery times are estimates and may vary based on location, weather, order volume, and other factors. Foodies is not responsible for delays caused by circumstances beyond our reasonable control. You are responsible for providing accurate delivery address information. Failed deliveries due to incorrect addresses may not be eligible for refunds.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">6. Refunds and Cancellations</h3>
                <p>Refund eligibility depends on the circumstances of each order. If you receive an incorrect or damaged order, please contact our support team within 24 hours of delivery. Approved refunds will be credited to your original payment method or as account credit within 5–10 business days. We reserve the right to decline refund requests that do not meet our refund policy criteria.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">7. Intellectual Property</h3>
                <p>All content on the Foodies platform, including but not limited to text, graphics, logos, images, and software, is the property of Foodies or its content suppliers and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without express written permission from Foodies.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">8. Limitation of Liability</h3>
                <p>To the maximum extent permitted by law, Foodies shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of your use of the Service. Our total liability for any claim arising from these Terms shall not exceed the amount you paid to Foodies in the 30 days preceding the claim.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">9. Changes to Terms</h3>
                <p>We reserve the right to modify these Terms of Service at any time. Changes will be effective immediately upon posting to the platform. Your continued use of the Service after any changes constitutes your acceptance of the new terms. We encourage you to review these terms periodically.</p>
              </section>

              <section>
                <h3 className="font-bold text-base mb-2 text-orange-600">10. Contact Us</h3>
                <p>If you have any questions about these Terms of Service, please contact us at <span className="text-orange-600 font-semibold">support@foodies.lk</span> or through our in-app support chat.</p>
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
                {hasReadAll ? "I Understand & Accept" : "Please read to the bottom ↓"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default TermsOfService;