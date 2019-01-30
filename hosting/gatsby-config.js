require("dotenv").config({
    path: `.env`,
})

module.exports = {
    plugins: [
        `gatsby-plugin-react-helmet`,
        {
            resolve: `gatsby-plugin-create-client-paths`,
            options: {
                prefixes: [`/view/*`]
            },
        },
        {
            resolve: `gatsby-plugin-google-analytics`,
            options: {
                trackingId: process.env.GA || "UA-92451506-4"
            },
        },
        {
            resolve: `gatsby-plugin-purgecss`,
            options: {
                printRejected: true, // Print removed selectors and processed file names
                develop: true, // Enable while using `gatsby develop`
                whitelistPatterns: [/^text-/, /nprogress/],
                whitelistPatternsChildren: [/nprogress/],
            }
        }
    ],
    proxy: {
        prefix: '/api',
        url: 'http://localhost:5000',
    }
}