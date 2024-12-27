/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./src/**/*.{html,js}'],
    theme: {
      extend: {
        colors: {
          primary:"#3B82F6",
          secondary:"#FFFFFF",
          tertiary:"#6B7280"
        }
      },
    },
    plugins: [require('@tailwindcss/forms')], // Ensure this line is added
  };
  