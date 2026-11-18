/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./core/Ui/**/*.{html,php,ts}",
    "./module/**/xxUi/**/*.{html,php,ts}",
    "./module/**/*.{html,php,ts}",
    "./public/**/*.html",
    "./index.php"
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
