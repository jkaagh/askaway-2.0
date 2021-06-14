
const colors = require('tailwindcss/colors')

module.exports = {
    mode: "jit",
  purge: ["./src/**/*.js"],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
        container: {
            center: true, //bootstrap container style
        },
        colors:{
            "cyan": colors.cyan,
            "primary": colors.cyan,
            "dark": "#2e2e35"
        },
    },
  },
  variants: {
    extend: {},
  },
  plugins: [],
}
