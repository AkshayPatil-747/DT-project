import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        brand: {
          50: "#fdf8ee",
          100: "#fbeed4",
          200: "#f7dba8",
          300: "#f2c173",
          400: "#eca13e",
          500: "#ff9900", // Amazon accent
          600: "#d97806",
          700: "#b45609",
          800: "#92430e",
          900: "#78370f",
        },
        amazon: {
          dark: "#131921",
          nav: "#232f3e",
          yellow: "#febd69",
          orange: "#ff9900",
          link: "#007185",
        },
        trust: {
          safe: "#10b981",    // emerald-500
          warning: "#f59e0b", // amber-500
          danger: "#ef4444",  // red-500
        }
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "spin-slow": "spin 8s linear infinite",
      },
    },
  },
  plugins: [],
};
export default config;
