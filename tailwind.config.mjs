/** @type {import('tailwindcss').Config} */

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      colors: {
        backMad: "#F7F2EC",
        redMad: "#8C1C13",
        textMad: "#252525",
        encartMad: "#BF4342",
      },
      fontFamily: {
        titleMad: ["Arbutus Slab", "serif"],
        bodyMad: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
};
