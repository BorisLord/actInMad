/** @type {import('tailwindcss').Config} */

export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        backMad: '#F5ECE1',
        redMad: '#8C1C13',
        textMad: '#252525',
        encartMad: '#BF4342',
      },
      fontFamily: {
        titleMad: ['Arbutus Slab', 'serif'],
        bodyMad: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
};
