/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink:    "#1a0f0a",
        paper:  "#f5e6c8",
        aged:   "#e8d5a3",
        vermil: "#c0392b",
        indigo: "#1a3a5c",
        gold:   "#c9a84c",
        jade:   "#2d6a4f",
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', 'serif'],
        sans:  ['"Noto Sans JP"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
