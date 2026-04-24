import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: { sans: ["Inter", "sans-serif"] },
      colors: {
        primary: { 50:"#eff6ff",100:"#dbeafe",200:"#bfdbfe",300:"#93c5fd",400:"#60a5fa",500:"#3b82f6",600:"#2563eb",700:"#1d4ed8",800:"#1e40af",900:"#1e3a8a" },
        accent:  { 50:"#f0fdf4",100:"#dcfce7",200:"#bbf7d0",300:"#86efac",400:"#4ade80",500:"#22c55e",600:"#16a34a",700:"#15803d",800:"#166534",900:"#14532d" },
      },
      animation: {
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up":   "slideUp 0.5s ease-out forwards",
        "fade-in":    "fadeIn 0.6s ease-out forwards",
        "slide-in":   "slideIn 0.5s ease-out forwards",
        blink:        "blink 1.5s ease-in-out infinite",
      },
      keyframes: {
        "pulse-glow": { "0%,100%":{ boxShadow:"0 0 20px rgba(59,130,246,0.3)" }, "50%":{ boxShadow:"0 0 40px rgba(59,130,246,0.6)" } },
        slideUp:  { from:{ opacity:"0", transform:"translateY(20px)" }, to:{ opacity:"1", transform:"translateY(0)" } },
        fadeIn:   { from:{ opacity:"0" }, to:{ opacity:"1" } },
        slideIn:  { from:{ opacity:"0", transform:"scale(0.9)" }, to:{ opacity:"1", transform:"scale(1)" } },
        blink:    { "0%,100%":{ opacity:"1" }, "50%":{ opacity:"0.5" } },
      },
    },
  },
  plugins: [],
};
export default config;
