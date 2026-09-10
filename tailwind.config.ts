import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        lena: {
          blue: {
            DEFAULT: "#00E5FF",
            glow: "#00E5FF80",
            dark: "#007799",
            deep: "#021A2E",
          },
          red: {
            DEFAULT: "#FF0055",
            glow: "#FF005580",
            dark: "#990033",
            deep: "#2B000F",
          },
          dark: {
            900: "#060709",
            800: "#0C0E14",
            700: "#131722",
            600: "#1C2130",
          }
        }
      },
      fontFamily: {
        rajdhani: ["Rajdhani", "system-ui", "sans-serif"],
        orbitron: ["Orbitron", "system-ui", "sans-serif"],
      },
      boxShadow: {
        "lena-blue": "0 0 25px rgba(0, 229, 255, 0.4)",
        "lena-red": "0 0 25px rgba(255, 0, 85, 0.4)",
        "lena-dual": "0 0 30px rgba(0, 229, 255, 0.3), 0 0 30px rgba(255, 0, 85, 0.3)",
      },
      animation: {
        "pulse-glow": "pulse-glow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scanner": "scanner 3s ease-in-out infinite",
        "hit-ping": "hit-ping 0.25s ease-out forwards",
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(0,229,255,0.7))" },
          "50%": { opacity: "0.6", filter: "drop-shadow(0 0 8px rgba(255,0,85,0.7))" },
        },
        "scanner": {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        }
      }
    },
  },
  plugins: [],
};
export default config;
