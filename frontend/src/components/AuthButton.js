import React from "react";

const AuthButton = ({ isSubmitting, label }) => {
  return (
    <button
      type="submit"
      disabled={isSubmitting}
      className="w-full bg-gradient-to-r from-blue-500 via-blue-600 to-blue-700 text-white py-2 px-4 rounded shadow-md hover:shadow-lg transition"
    >
      {isSubmitting ? "Processing..." : label}
    </button>
  );
};

export default AuthButton;
