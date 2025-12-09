module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'flyfast-yellow': '#FFD42A',
        'flyfast-blue': '#0C2E6D',
        'flyfast-light-blue': '#3A7BFF',
        'flyfast-light-yellow': '#FFF9E6',
      },
      fontFamily: {
        'heading': ['Poppins', 'sans-serif'],
        'body': ['Open Sans', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      }
    },
  },
  plugins: [],
}