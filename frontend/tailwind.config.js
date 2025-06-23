/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}", // Include all relevant files
  ],
  theme: {
    extend: {
      colors: {
        primary: '#16a34a', // ✅ Tailwind green-600
        secondary: '#6b7280', // ✅ Tailwind gray-500
        lightGray: '#f8f9fa',
        darkGray: '#343a40',
      },
      fontFamily: {
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui'],
      },
      boxShadow: {
        card: '0 4px 14px rgba(0, 0, 0, 0.1)',
        navbar: '0 2px 10px rgba(0, 0, 0, 0.05)',
      },
      animation: {
        fadeIn: 'fadeIn 0.4s ease-in-out',
        slideIn: 'slideIn 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        slideIn: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
