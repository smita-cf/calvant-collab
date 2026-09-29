/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",        // ← App Router pages (WAS MISSING)
    "./src/**/*.{js,jsx,ts,tsx}",         // ← components, modules, context
    "./components/**/*.{js,jsx,ts,tsx}",  // ← root-level components if any
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};