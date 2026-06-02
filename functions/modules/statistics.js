const {
  lightHttpsFunctions
} = require('../utils')

module.exports = lightHttpsFunctions.onRequest(async (req, res) => {
  let statistics = []
  // Static, non-personalized response — cache aggressively at the CDN edge
  res.set('Cache-Control', 'public, max-age=3600, s-maxage=86400')
  res.json(statistics)
})