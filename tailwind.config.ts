import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'gray-faint': '#ffffff14',
        'gray-extra-light': '#efefef',
        'gray-dark': '#161616',
        'gray': '#b7b7b7'
      },
      maxWidth: {
        'percent-25': '25%',
        'percent-50': '50%',
        'percent-75': '75%',
        'percent-80': '80%',
        'percent-90': '90%',
      },
      backgroundSize: {
        'percent-10': '10%',
        'percent-20': '20%',
        'percent-30': '30%',
        'percent-40': '40%',
        'percent-50': '50%',
        'percent-60': '60%',
        'percent-70': '70%',
        'percent-80': '80%',
        'percent-90': '90%',
      },
      transitionDuration: {
        '600': '600ms',
        '800': '800ms',
        '900': '900ms',
        '2000': '2000ms',
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide')
  ],
};
export default config;
