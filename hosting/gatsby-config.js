require("dotenv").config({
  path: `.env`,
})  

module.exports = {
  plugins: [
    `gatsby-plugin-react-helmet`,
    {
      resolve: `gatsby-plugin-create-client-paths`,
      options: { prefixes: [`/view/*`] },
    },
  ],
  proxy: {
    prefix: '/api',
    url: 'http://localhost:5000',
  }
}