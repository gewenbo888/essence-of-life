import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // deep space — the void life emerges from
        void: {
          950: "#020308",
          900: "#04060f",
          850: "#070a16",
          800: "#0a0e1e",
          700: "#101630",
          600: "#18203f",
          500: "#222c52",
        },
        // starlight — text
        star: {
          50: "#f6f8ff",
          100: "#eaeefb",
          200: "#cdd6ee",
          300: "#a6b2d4",
          400: "#7c89ad",
          500: "#5a6485",
          600: "#414c6c",
        },
        // bio — life, metabolism, the living green
        bio: {
          600: "#19a97e",
          500: "#2bd49f",
          400: "#52e7b6",
          300: "#8cf3d2",
        },
        // ion — cyan, information / data
        ion: {
          600: "#0b9fd1",
          500: "#22cdf0",
          400: "#5fe0f7",
          300: "#9eeefb",
        },
        // plasma — violet, consciousness / cognition
        plasma: {
          600: "#6d3df0",
          500: "#9166ff",
          400: "#b394ff",
          300: "#d3c0ff",
        },
        // gold — mathematics, the golden ratio
        gold: {
          600: "#d49a3a",
          500: "#eab85c",
          400: "#f4cd83",
          300: "#fae2b3",
        },
        // ember — entropy, energy, warmth against the cold
        ember: {
          600: "#e0524f",
          500: "#fb7185",
          400: "#ff96a6",
        },
      },
      fontFamily: {
        display: ['"Cormorant Garamond"', "ui-serif", "Georgia", "serif"],
        sans: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        serif: ['"Spectral"', "ui-serif", "Georgia", "serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
        zh: ['"Noto Serif SC"', "serif"],
      },
      letterSpacing: {
        cosmic: "0.42em",
      },
      boxShadow: {
        card: "inset 0 1px 0 rgba(180,200,255,0.06), 0 30px 80px -40px rgba(0,0,0,0.95)",
        glow: "0 0 60px -12px rgba(43,212,159,0.5)",
        glowviolet: "0 0 60px -12px rgba(145,102,255,0.5)",
        glowion: "0 0 60px -12px rgba(34,205,240,0.5)",
      },
      keyframes: {
        drift: {
          "0%,100%": { transform: "translateY(0) translateX(0)" },
          "50%": { transform: "translateY(-18px) translateX(8px)" },
        },
        breathe: {
          "0%,100%": { opacity: "0.35" },
          "50%": { opacity: "0.85" },
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" },
        },
      },
      animation: {
        drift: "drift 14s ease-in-out infinite",
        breathe: "breathe 6s ease-in-out infinite",
        shimmer: "shimmer 8s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
