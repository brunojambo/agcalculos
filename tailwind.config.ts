import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ag: {
          ink: "#111827",
          muted: "#6B7280",
          line: "#E5E7EB",
          bg: "#F9FAFB",
          blue: "#1D4ED8"
        }
      }
    }
  },
  plugins: []
};
export default config;
