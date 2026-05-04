import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Lumen brand palette (extracted from screenshots — purple/violet brand)
        lumen: {
          // Primary purples
          purple: {
            50: "#F5EFFE",
            100: "#E9DBFC",
            200: "#D4B8F8",
            300: "#BB95F2",
            400: "#9B72E0",
            500: "#7E4CD9",
            600: "#6E3CDF",  // Primary brand purple
            700: "#5B2CC4",
            800: "#4920A0",
            900: "#2E1372",
            950: "#1B0A4D",
          },
          // Pink/magenta accent (from "Save $$200" gradient and patches)
          pink: "#FF608F",
          magenta: "#C453FD",
          // Mint accent used in promo banners
          mint: "#7CE7C7",
          // Dark navy (promo bar, footer)
          dark: "#0E0828",
          darker: "#070318",
          // Page-level near-black (default body bg in dark theme)
          night: "#0a0613",
          // Slightly elevated dark surface for cards / panels
          surface: "#14092b",
          // Surface
          cream: "#F8F5FB",
          gray: "#6B6685",
        },
      },
      fontFamily: {
        sans: ["var(--font-mulish)", "system-ui", "sans-serif"],
        display: ["var(--font-mulish)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "purple-gradient":
          "linear-gradient(135deg, #6E3CDF 0%, #9B72E0 100%)",
        "purple-deep-gradient":
          "linear-gradient(180deg, #4920A0 0%, #2E1372 100%)",
        "pink-purple-gradient":
          "linear-gradient(90deg, #FF608F 0%, #C453FD 100%)",
      },
      boxShadow: {
        "card": "0 8px 32px rgba(46, 19, 114, 0.08)",
        "card-lg": "0 12px 48px rgba(46, 19, 114, 0.12)",
        "purple-glow": "0 8px 40px rgba(110, 60, 223, 0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
      },
    },
  },
  plugins: [],
};

export default config;
