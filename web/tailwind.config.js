/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  // O reset fica a cargo do CssBaseline do Material UI.
  corePlugins: { preflight: false },
  important: "#root",
  theme: { extend: {} },
  plugins: [],
};
