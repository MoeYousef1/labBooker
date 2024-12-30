/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{html,js}"],
  theme: {
    extend: {
      colors: {
        primary: "#3B82F6",
        secondary: "#FFFFFF",
        tertiary: "#6B7280",
        blueLight: "#60A5FA", // Lighter blue shade
        blueMid: "#2563EB", //blue 600
        blueDark: "#1E40AF", // Darker blue shade
        blueExtraDark: "#1E3A8A", // Blue 950
        grayLight: "#D1D5DB", // gray-400 equivalent
        grayMid: "#4B5563", // gray-600 equivalent
        grayDark: "#1F2937", // gray-800 equivalent
        grayExtraDark: "#111827",
      },
      backgroundImage: {
        "gradient-primaryToRight":
          "linear-gradient(to right, #60A5FA, #1E40AF)", // Blue gradient from left to right
        "gradient-primaryToLeft": "linear-gradient(to left, #60A5FA, #1E40AF)", // Blue gradient from right to left
        "gradient-grayToRight": "linear-gradient(to right, #D1D5DB, #1F2937)", // gray-400 to gray-800 gradient
        "gradient-grayToLeft": "linear-gradient(to left, #D1D5DB, #1F2937)", // gray-400 to gray-800 gradient (opposite direction)
        "gradient-grayMidToRight":
          "linear-gradient(to right, #4B5563, #111827)", // gray-600 to gray-800 gradient
        "gradient-grayMidToLeft": "linear-gradient(to left, #4B5563, #1F2937)", // gray-600 to gray-800 gradient (opposite direction)
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
