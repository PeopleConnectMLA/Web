/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: "#1B2740",
          light: "#28395c",
          dark: "#121b2e",
        },
        parchment: {
          DEFAULT: "#F6F1E4",
          dark: "#EDE5D0",
        },
        seal: {
          DEFAULT: "#A63A2C",
          light: "#C24E3D",
          dark: "#7E2B20",
        },
        banyan: {
          DEFAULT: "#2E5339",
          light: "#3E6B4B",
        },
        marigold: {
          DEFAULT: "#D9A02A",
          light: "#E8B84E",
        },
        slateink: {
          DEFAULT: "#5B6472",
        },
      },
      fontFamily: {
        display: ["Fraunces", "Georgia", "serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "monospace"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,39,64,0.06), 0 1px 12px rgba(27,39,64,0.06)",
        stamp: "0 0 0 3px rgba(166,58,44,0.15)",
      },
      backgroundImage: {
        grain: "radial-gradient(circle at 1px 1px, rgba(27,39,64,0.045) 1px, transparent 0)",
      },
      backgroundSize: {
        grain: "18px 18px",
      },
    },
  },
  plugins: [],
}

