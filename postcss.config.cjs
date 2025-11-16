// Use the new PostCSS bridge package for Tailwind as required by Tailwind v4+
module.exports = {
  plugins: {
    // Replace direct `tailwindcss` plugin with the bridge package
    '@tailwindcss/postcss': {},
    autoprefixer: {},
  }
}
