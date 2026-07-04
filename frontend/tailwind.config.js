/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#172321",
          soft: "#2A3B37",
          muted: "#5C6B67",
        },
        base: {
          DEFAULT: "#F4F6F5",
          card: "#FFFFFF",
          border: "#DDE3E0",
        },
        brand: {
          50: "#EAF3F0",
          100: "#CFE4DC",
          300: "#7FB3A0",
          500: "#2F6F5E",
          600: "#255A4C",
          700: "#1C463C",
        },
        ore: {
          100: "#FBEACD",
          400: "#E8A33D",
          600: "#B87A1F",
        },
        success: {
          100: "#DFF0E4",
          500: "#3F8F5F",
          700: "#2A6642",
        },
        danger: {
          100: "#F7DEDC",
          500: "#C1443C",
          700: "#932E28",
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(23,35,33,0.06), 0 1px 12px rgba(23,35,33,0.04)",
      },
    },
  },
  plugins: [],
};
