/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "canvas-bg": "#F8FAFC",
        "sidebar-bg": "#0F172A",
        "surface-white": "#FFFFFF",
        primary: "#004ac6",
        "primary-container": "#2563eb",
        "status-success": "#10B981",
        "status-success-bg": "#ECFDF5",
        "status-warning": "#F59E0B",
        "status-warning-bg": "#FFFBEB",
        "status-danger": "#EF4444",
        "status-danger-bg": "#FEF2F2",
        "status-info": "#6366F1",
        "status-info-bg": "#EEF2FF",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Pretendard", "Segoe UI", "Roboto", "sans-serif"],
      },
    },
  },
  plugins: [],
};
