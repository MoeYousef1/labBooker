import React from "react";

const Message = ({ message, onClose, type }) => {
  if (!message) return null;

  const messageType =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : "bg-red-100 border-red-400 text-red-700";

  const closeButtonColor =
    type === "success" ? "text-green-500" : "text-red-500";

  return (
    <div
      className={`${messageType} border px-4 py-2 rounded mt-1 relative flex items-start min-w-0`}
      role="alert"
    >
      <span className="flex-grow pr-10">{message}</span>{" "}
      {/* Add padding-right for space */}
      {onClose && (
        <button onClick={onClose} className="absolute top-0 right-0 px-3 py-3">
          <svg
            className={`fill-current h-6 w-6 ${closeButtonColor}`}
            role="button"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <title>Close</title>
            <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default Message;
