const { httpsFunctions, db, functionsUrl, 
        collection, hash, redash_format } = require('../utils')

module.exports = httpsFunctions.onRequest(async (req, res) => {
  const redash = req.query.redash || req.query.redash_format
  const getSnapshow = async () => await db.collection(collection.URLS).get()

  let statistics = []
  res.json(statistics)
})
