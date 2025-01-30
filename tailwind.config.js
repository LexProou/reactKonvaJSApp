/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}', // Adjust the paths according to your project structure
    './public/index.html',
  ],
  theme: {
    extend: {
      // Extend your theme here
      colors: {
        customColor: '#1c1c1e',
      },
    },
  },
  plugins: [
    // Add any plugins you need here
  ],
};