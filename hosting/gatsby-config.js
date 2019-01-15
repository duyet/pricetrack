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
        {
            resolve: `gatsby-plugin-google-analytics`,
            options: {
                trackingId: process.env.GA || "UA-92451506-4"
            },
        },
    ],
    proxy: {
        prefix: '/api',
        url: 'http://localhost:5000',
    }
}