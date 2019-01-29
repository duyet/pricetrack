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
        { 
            resolve: `gatsby-plugin-purgecss`,
            options: {
                printRejected: true, // Print removed selectors and processed file names
                develop: true, // Enable while using `gatsby develop`
                whitelistPatterns: [/^text-/, /nprogress/],
                whitelistPatternsChildren: [/nprogress/],
                // tailwind: true, // Enable tailwindcss support
                // whitelist: ['whitelist'], // Don't remove this selector
                // ignore: ['/ignored.css', 'prismjs/', 'docsearch.js/'], // Ignore files/folders
                // purgeOnly : ['components/', '/main.css', 'bootstrap/'], // Purge only these files/folders
            }
        }
    ],
    proxy: {
        prefix: '/api',
        url: 'http://localhost:5000',
    }
}