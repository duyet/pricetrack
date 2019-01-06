require("dotenv").config({
  path: `.env`,
})  

module.exports = {
  plugins: [
    `gatsby-plugin-react-helmet`
  ],
  proxy: {
    prefix: '/api',
    url: 'http://localhost:5005',
  }
}