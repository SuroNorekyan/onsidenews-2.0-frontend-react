module.exports = {
  darkMode: "class", // << important
  content: ["./src/**/*.{ts,tsx,js,jsx,html}"],
  theme: {
    extend: {},
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/line-clamp"),
  ],
};
