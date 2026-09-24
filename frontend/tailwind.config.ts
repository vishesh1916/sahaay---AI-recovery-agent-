import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#FFFFFF",
        foreground: "#0A1128",
        sahaay: {
          sky: {
            DEFAULT: "#127DE9",
            50: "#EFF6FF",
            100: "#DBEAFE",
            200: "#BFDBFE",
            300: "#93C5FD",
            400: "#60A5FA",
            500: "#2693F8",
            600: "#127DE9",
            700: "#0D66C2",
            800: "#0A5099",
            900: "#063D7E",
            950: "#03244D",
          },
          azure: "#2693F8",
          volt: {
            DEFAULT: "#D7F742",
            hover: "#C5E630",
            light: "#F3FDC8",
          },
          navy: {
            DEFAULT: "#0A1128",
            muted: "#475569",
            light: "#64748B",
            950: "#070D1F",
            900: "#0A1128",
            850: "#0F1A3A",
            800: "#1E293B",
          },
          ice: "#F0F7FF",
          mist: "#F8FAFC",
          ivory: "#FFFFFF",
          card: "#FFFFFF",
          "card-hover": "#F8FAFC",
          emerald: {
            DEFAULT: "#059669",
            soft: "#10B981",
            pale: "#ECFDF5",
          },
          amber: {
            DEFAULT: "#D97706",
            soft: "#F59E0B",
            pale: "#FFFBEB",
          },
          rose: {
            DEFAULT: "#E11D48",
            soft: "#F43F5E",
            pale: "#FFF1F2",
          },
          // Reference atmospheric palette
          atmospheric: {
            deep: "#246BB2",
            mid: "#3F82C4",
            soft: "#6688C9",
            lavender: "#A5B4DE",
            periwinkle: "#C0C7E3",
            cloudPink: "#F3C8D9",
            cloudRose: "#EBA9CD",
            cloudBlush: "#F9D7E5",
            softLavender: "#D9D3EF",
            paleLavender: "#E8E4F6",
            text: "#101B35",
            secondary: "#596980",
            warmWhite: "#FCFBF8",
            accent: "#D9FF32",
          },
        },
        evidence: {
          verified: "#059669",
          extracted: "#2563EB",
          user: "#7C3AED",
          estimated: "#D97706",
          conflicting: "#DC2626",
          review: "#EA580C",
          missing: "#64748B",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Plus Jakarta Sans", "Inter", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Plus Jakarta Sans", "Inter", "sans-serif"],
        serif: ["var(--font-serif)", "Newsreader", "Playfair Display", "Georgia", "serif"],
      },
      borderRadius: {
        "2.5xl": "1.25rem",
        "3xl": "1.5rem",
        "4xl": "2rem",
        "5xl": "2.5rem",
        "6xl": "3rem",
      },
      boxShadow: {
        subtle: "0 4px 20px -2px rgba(109, 40, 217, 0.04)",
        card: "0 10px 30px -5px rgba(109, 40, 217, 0.06), 0 2px 6px -1px rgba(0, 0, 0, 0.02)",
        "card-hover": "0 20px 40px -10px rgba(109, 40, 217, 0.12), 0 4px 12px -2px rgba(0, 0, 0, 0.03)",
        floating: "0 25px 60px -12px rgba(109, 40, 217, 0.16), 0 8px 24px -4px rgba(0, 0, 0, 0.04)",
        glow: "0 0 40px rgba(147, 51, 234, 0.15)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
        float: "float 6s ease-in-out infinite",
        "float-delayed": "float 6s ease-in-out 3s infinite",
        "pulse-subtle": "pulseSubtle 3s ease-in-out infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        pulseSubtle: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
