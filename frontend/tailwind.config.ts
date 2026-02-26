import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#1a1a2e",
          mid: "#16213e",
          accent: "#0f3460",
          blue: "#533483",
          light: "#e94560",
        },
      },
    },
  },
  plugins: [],
};

export default config;
