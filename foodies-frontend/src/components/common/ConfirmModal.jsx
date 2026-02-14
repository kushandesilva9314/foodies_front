import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Trash2, AlertCircle, Info } from "lucide-react";

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title = "Confirm Action", 
  message = "Are you sure you want to proceed?", 
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonClass = "bg-gradient-to-r from-red-500 to-red-600",
  type = "danger", // danger, warning, info
  loading = false 
}) => {
  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 className="w-8 h-8 text-red-600" />,
    warning: <AlertTriangle className="w-8 h-8 text-yellow-600" />,
    info: <Info className="w-8 h-8 text-blue-600" />
  };

  const iconBgColors = {
    danger: "bg-red-100",
    warning: "bg-yellow-100",
    info: "bg-blue-100"
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-[9998] flex items-center justify-center p-4"
          >
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-lg shadow-2xl max-w-md w-full p-6"
            >
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={`${iconBgColors[type]} rounded-full p-3`}>
                  {icons[type]}
                </div>
              </div>

              {/* Title */}
              <h3 className="text-xl font-bold text-gray-800 text-center mb-2">
                {title}
              </h3>

              {/* Message */}
              <p className="text-gray-600 text-center mb-6 leading-relaxed">
                {message}
              </p>

              {/* Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onClose}
                  disabled={loading}
                  className="flex-1 px-4 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onConfirm}
                  disabled={loading}
                  className={`flex-1 px-4 py-2.5 ${confirmButtonClass} text-white rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {loading ? "Processing..." : confirmText}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default ConfirmModal;