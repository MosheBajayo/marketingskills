import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // High-contrast, data-driven tech palette
        ink: {
          950: "#060709", // page background (near-black)
          900: "#0A0C10", // elevated background
          850: "#0E1116",
          800: "#141821", // card surface
          700: "#1B212D", // hairline / raised surface
          600: "#2A3242", // borders
        },
        // Primary brand accent — "signal" green (growth / revenue)
        signal: {
          50: "#ECFDF5",
          100: "#D1FAE5",
          200: "#A7F3D0",
          300: "#6EE7B7",
          400: "#34D399",
          500: "#10B981", // primary
          600: "#059669",
          700: "#047857",
        },
        // Tech / SaaS audience accent — electric sky
        tech: {
          300: "#7DD3FC",
          400: "#38BDF8",
          500: "#0EA5E9",
          600: "#0284C7",
        },
        // E-commerce / D2C audience accent — warm amber
        commerce: {
          300: "#FDBA74",
          400: "#FB923C",
          500: "#F97316",
          600: "#EA580C",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      backgroundImage: {
        "signal-gradient": "linear-gradient(135deg, #34D399 0%, #10B981 100%)",
        "grid-fade":
          "linear-gradient(to bottom, rgba(6,7,9,0) 0%, #060709 100%)",
      },
      boxShadow: {
        glow: "0 0 60px rgba(16, 185, 129, 0.18)",
        "glow-sm": "0 0 30px rgba(16, 185, 129, 0.15)",
        card: "0 12px 40px rgba(0, 0, 0, 0.35)",
      },
      borderRadius: {
        "4xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-slow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out forwards",
        "pulse-slow": "pulse-slow 3s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
