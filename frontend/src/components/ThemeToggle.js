// components/ThemeToggle.js
import { useContext } from "react";
import { ThemeContext } from "../contexts/ThemeContext";

export const ThemeToggle = () => {
  const { isDark, toggleTheme } = useContext(ThemeContext);

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700"
    >
      {isDark ? "🌞 Light" : "🌙 Dark"}
    </button>
  );
};
