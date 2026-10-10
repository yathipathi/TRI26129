import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--md-sys-color-surface)",
        foreground: "var(--md-sys-color-on-surface)",
        md: {
          primary: "var(--md-sys-color-primary)",
          "on-primary": "var(--md-sys-color-on-primary)",
          "primary-container": "var(--md-sys-color-primary-container)",
          "on-primary-container": "var(--md-sys-color-on-primary-container)",
          secondary: "var(--md-sys-color-secondary)",
          "on-secondary": "var(--md-sys-color-on-secondary)",
          "secondary-container": "var(--md-sys-color-secondary-container)",
          "on-secondary-container": "var(--md-sys-color-on-secondary-container)",
          tertiary: "var(--md-sys-color-tertiary)",
          "on-tertiary": "var(--md-sys-color-on-tertiary)",
          "tertiary-container": "var(--md-sys-color-tertiary-container)",
          "on-tertiary-container": "var(--md-sys-color-on-tertiary-container)",
          error: "var(--md-sys-color-error)",
          "on-error": "var(--md-sys-color-on-error)",
          "error-container": "var(--md-sys-color-error-container)",
          "on-error-container": "var(--md-sys-color-on-error-container)",
          surface: "var(--md-sys-color-surface)",
          "surface-dim": "var(--md-sys-color-surface-dim)",
          "surface-bright": "var(--md-sys-color-surface-bright)",
          "surface-lowest": "var(--md-sys-color-surface-container-lowest)",
          "surface-low": "var(--md-sys-color-surface-container-low)",
          "surface-container": "var(--md-sys-color-surface-container)",
          "surface-high": "var(--md-sys-color-surface-container-high)",
          "surface-highest": "var(--md-sys-color-surface-container-highest)",
          "on-surface": "var(--md-sys-color-on-surface)",
          "on-surface-variant": "var(--md-sys-color-on-surface-variant)",
          outline: "var(--md-sys-color-outline)",
          "outline-variant": "var(--md-sys-color-outline-variant)",
        },
      },
      borderRadius: {
        'md-xs': 'var(--md-shape-corner-xs)',
        'md-sm': 'var(--md-shape-corner-sm)',
        'md-md': 'var(--md-shape-corner-md)',
        'md-lg': 'var(--md-shape-corner-lg)',
        'md-xl': 'var(--md-shape-corner-xl)',
        'md-full': 'var(--md-shape-corner-full)',
      },
      boxShadow: {
        'md-1': 'var(--md-elevation-1)',
        'md-2': 'var(--md-elevation-2)',
        'md-3': 'var(--md-elevation-3)',
        'md-4': 'var(--md-elevation-4)',
        'md-5': 'var(--md-elevation-5)',
      },
      fontFamily: {
        sans: ["var(--md-font-family)", "Roboto", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--md-font-mono)", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
