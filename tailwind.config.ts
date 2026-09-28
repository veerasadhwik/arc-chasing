import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        arc: {
          bg: "#080A0F",
          secondary: "#10131A",
          card: "#151922",
          border: "rgba(255, 255, 255, 0.08)",
          "border-hover": "rgba(142, 216, 255, 0.25)",
          text: "#F5F7FA",
          muted: "#8D95A5",
          ice: "#8ED8FF",
          "ice-glow": "rgba(142, 216, 255, 0.15)",
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-geist-sans)", "Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
