/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],

  theme: {
    extend: {
      /* =========================
         LIFE LINK COLOR SYSTEM
      ========================= */
      colors: {
        primary: "#2563eb", // blue (main brand)
        secondary: "#10b981", // green (success / donors)
        danger: "#ef4444", // red (alerts / errors)

        admin: "#7c3aed", // purple (admin dashboard)
        donor: "#16a34a", // green
        recipient: "#f59e0b", // amber
        hospital: "#0ea5e9", // sky blue

        background: "#f9fafb",
        card: "#ffffff",
        muted: "#6b7280",
      },

      /* =========================
         FONT SYSTEM
      ========================= */
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },

      /* =========================
         SHADOWS (UI CARDS)
      ========================= */
      boxShadow: {
        soft: "0 2px 10px rgba(0,0,0,0.08)",
        medium: "0 6px 20px rgba(0,0,0,0.12)",
      },

      /* =========================
         BORDER RADIUS
      ========================= */
      borderRadius: {
        xl: "1rem",
        xxl: "1.5rem",
      },
    },
  },

  plugins: [],
};