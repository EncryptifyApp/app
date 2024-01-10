/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}","./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "primary": "#00e701",
        "midnight-black": "#0b0e0f",
        "steel-gray": "#191b1f",
        "stormy-gray": "#24272c",
        "smokey-teal": "#474f54",
      },
      fontFamily: {
          'primary-regular': ['Rajdhani_400Regular'],
          'primary-medium': ['Rajdhani_500Medium'],
          'primary-semibold': ['Rajdhani_600SemiBold'],
          'primary-bold': ['Rajdhani_700Bold'],
      },
    },
  },
  plugins: [],
}