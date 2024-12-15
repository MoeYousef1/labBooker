import React from "react";

function Button({ text, onClick, type = "button", className = "", children }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-xl shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 ${className}`}
    >
      {children || text}
    </button>
  );
}

export default Button;
