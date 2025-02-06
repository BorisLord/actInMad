/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        madBack: "#F5ECE1",
        madRed: "#8C1C13",
        madText: "#252525",
        madEncart: "#BF4342",
      },
      fontFamily: {
        madTitleFont: ["Arbutus Slab", "serif"],
        madBodyFont: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};
