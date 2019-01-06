const functions = require('firebase-functions')
const { db, functions_url, collection, hash, redash_format } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
  const redash = req.query.redash || req.query.redash_format
  const getSnapshow = async () => await db.collection(collection.RAW_DATA).get()

  let statistics = []
  let snapshotRaw = getSnapshow()
  statistics.push({ metric: 'count', value: snapshotRaw.size })

  res.json(statistics)
})
