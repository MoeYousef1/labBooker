import React, { useEffect } from "react";
import { X } from "lucide-react";

const Toast = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 5000); // Auto close after 5 seconds
    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-100"
      : type === "error"
        ? "bg-red-100"
        : "bg-blue-100";

  const textColor =
    type === "success"
      ? "text-green-800"
      : type === "error"
        ? "text-red-800"
        : "text-blue-800";

  return (
    <div
      className={`fixed bottom-5 right-5 ${bgColor} border-l-4 border-${type === "success" ? "green" : type === "error" ? "red" : "blue"}-500 p-4 rounded shadow-lg flex items-start space-x-3`}
    >
      <div className={`flex-shrink-0 ${textColor}`}>
        {/* You can add an icon based on the type here */}
      </div>
      <div className="flex-1 text-sm text-gray-700">{message}</div>
      <button onClick={onClose} className={`${textColor} hover:text-gray-900`}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
