/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ayPurple: "#604FD6",  // Purple
        ayPurpleLight: "#8778E8",  // Light Purple
        ayDark: "#494454",    // Dark Gray
        ayLavender: "#AEA9BA",  // Soft Grayish Lavender
        ayGreen: "#007E58",   // Deep Green
        ayTeal: "#00B68A",    // Bright Teal
      },
    },
  },
  plugins: [],
}