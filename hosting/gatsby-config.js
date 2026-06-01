require('dotenv').config({
  path: '.env',
});

module.exports = {
  plugins: [
    'gatsby-plugin-react-helmet',
    {
      resolve: 'gatsby-plugin-create-client-paths',
      options: {
        prefixes: ['/view/*']
      },
    },
    {
      resolve: 'gatsby-plugin-google-gtag',
      options: {
        trackingIds: [process.env.GA || 'UA-92451506-4'],
      },
    },
    'gatsby-plugin-sass',
    {
      resolve: 'gatsby-plugin-manifest',
      options: {
        name: 'pricetrack',
        short_name: 'pricetrack',
        start_url: '/?utm_source=homescreen&utm_medium=shortcut',
        background_color: '#faf9f5',
        theme_color: '#cc785c',
        // Enables "Add to Homescreen" prompt and disables browser UI (including back button)
        // see https://developers.google.com/web/fundamentals/web-app-manifest/#display
        display: 'standalone',
        icon: 'static/icon.png', // This path is relative to the root of the site.
        include_favicon: true, // Include favicon
        share_target: {
          action: 'add',
          method: 'GET',
          params: {
            title: 'title',
            text: 'text',
            url: 'url'
          },
        },
      },
    },
  ],
  proxy: {
    prefix: '/api',
    url: 'http://localhost:5000',
  }
};
