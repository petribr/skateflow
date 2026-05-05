import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0b0b0f",
        surface: "#15151c",
        line: "#23232d",
        accent: "#ff5a1f"
      }
    }
  },
  plugins: []
} satisfies Config;
