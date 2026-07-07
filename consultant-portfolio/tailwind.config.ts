import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Bold high-contrast system: carbon black + volt accent
        carbon: {
          950: "#050505", // page background
          900: "#0A0A0A", // elevated background
          850: "#101010",
          800: "#161616", // card surface
          700: "#1F1F1F", // raised surface
          600: "#2B2B2B", // strong borders
        },
        volt: {
          200: "#EFFF99",
          300: "#E5FF66",
          400: "#D9FF33",
          500: "#CCFF00", // primary accent
          600: "#A8D400",
          700: "#85A800",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        display: ["var(--font-grotesk)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      letterSpacing: {
        tightest: "-0.045em",
      },
      boxShadow: {
        volt: "0 0 60px rgba(204, 255, 0, 0.15)",
        "volt-sm": "0 0 24px rgba(204, 255, 0, 0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        marquee: "marquee 28s linear infinite",
        "marquee-slow": "marquee 44s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
