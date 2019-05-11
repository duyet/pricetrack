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
                develop: false, // Enable while using `gatsby develop`
                whitelistPatterns: [/^text-/, /nprogress/, /fa/, /ReactTable/, /skylight/],
                whitelistPatternsChildren: [/nprogress/, /fa/, /ReactTable/, /skylight/],
            }
        },
        {
            resolve: `gatsby-plugin-manifest`,
            options: {
              name: `pricetrack`,
              short_name: `pricetrack`,
              start_url: `/`,
              background_color: `#f8f9fa`,
              theme_color: `#f8f9fa`,
              // a hard-coded value indicating that FCM is authorized to send messages to this app
              // The browser sender ID is a fixed value, common among all FCM JavaScript clients.
              gcm_sender_id: `103953800507`,
              // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
              // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
              display: `standalone`,
              icon: `static/icon.png`, // This path is relative to the root of the site.
              include_favicon: true, // Include favicon
            },
        },
    ],
    proxy: {
        prefix: '/api',
        url: 'http://localhost:5000',
    }
}