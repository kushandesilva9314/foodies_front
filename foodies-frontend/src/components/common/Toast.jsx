import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { CheckCircle, XCircle, AlertCircle, Info, X } from "lucide-react";

const Toast = ({ message, type = "success", onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const config = {
    success: {
      icon: <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      colors: "bg-green-50 border-green-500 text-green-800",
      iconColor: "text-green-600"
    },
    error: {
      icon: <XCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      colors: "bg-red-50 border-red-500 text-red-800",
      iconColor: "text-red-600"
    },
    warning: {
      icon: <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />,
      colors: "bg-yellow-50 border-yellow-500 text-yellow-800",
      iconColor: "text-yellow-600"
    },
    info: {
      icon: <Info className="w-5 h-5 sm:w-6 sm:h-6" />,
      colors: "bg-blue-50 border-blue-500 text-blue-800",
      iconColor: "text-blue-600"
    }
  };

  const currentConfig = config[type] || config.info;

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, x: 50 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      className={`${currentConfig.colors} border-l-4 p-3 sm:p-4 rounded-lg shadow-xl flex items-start space-x-3 max-w-sm sm:max-w-md min-w-[280px] sm:min-w-[320px]`}
    >
      <div className={`flex-shrink-0 ${currentConfig.iconColor}`}>
        {currentConfig.icon}
      </div>
      <p className="flex-1 text-sm sm:text-base font-medium leading-relaxed">
        {message}
      </p>
      <button
        onClick={onClose}
        className="flex-shrink-0 hover:opacity-70 transition-opacity ml-2"
        aria-label="Close notification"
      >
        <X className="w-4 h-4 sm:w-5 sm:h-5" />
      </button>
    </motion.div>
  );
};

export default Toast;