/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#fbc8d1",
        foreground: "#333333",
        "secondary-bg": "#feface",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            boxShadow:
              "0 0 40px rgba(251, 191, 36, 0.8), 0 0 80px rgba(251, 191, 36, 0.4), inset 0 0 30px rgba(251, 191, 36, 0.2)",
          },
          "50%": {
            boxShadow:
              "0 0 20px rgba(251, 191, 36, 0.6), 0 0 40px rgba(251, 191, 36, 0.3), inset 0 0 15px rgba(251, 191, 36, 0.1)",
          },
        },
      },
    },
  },
  plugins: [],
};
