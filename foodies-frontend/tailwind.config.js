/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Colors
        'primary': '#E63946',        // Tomato Red - Stimulates appetite
        'secondary': '#F4A261',      // Mustard Yellow - Warm, friendly
        'action': '#2A9D8F',         // Green - Order buttons, positive action
        
        // Background & Text
        'bg-light': '#FFF7E6',       // Cream/Off-white background
        'text-primary': '#264653',   // Dark Charcoal - Good readability
        'text-secondary': '#6C757D', // Gray - Subtle info
        
        // Accent Colors
        'highlight': '#F28482',      // Orange - Warm highlights
        'card-bg': '#F1FAEE',        // Light Gray/White - Cards
      },
      fontFamily: {
        'display': ['Poppins', 'sans-serif'],
        'body': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 2px 15px rgba(38, 70, 83, 0.1)',
        'medium': '0 4px 20px rgba(38, 70, 83, 0.15)',
        'hard': '0 8px 30px rgba(38, 70, 83, 0.2)',
      },
    },
  },
  plugins: [],
}