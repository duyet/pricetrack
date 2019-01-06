const functions = require('firebase-functions')
const { db, functions_url, collection, hash, redash_format } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
  const url = req.query.url
  const orderBy = req.query.order && req.query.order == 'desc' ? 'desc' : 'asc'
  const redash = req.query.redash || req.query.redash_format
  const limit = req.query.limit ? parseInt(req.query.limit) : 100

  db
    .collection(collection.RAW_DATA)
    .doc(hash(url))
    .collection('raw')
    .orderBy('datetime', orderBy)
    .limit(limit)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return res.json([])
      else {
        let docs = []
        snapshot.forEach(doc => {
          docs.push(doc.data())
        })

        return redash ? res.json(redash_format(docs)) : res.json(docs)
      }
    })
    .catch(err => {
      console.log('Error getting documents', err)
      return res.status(400).json([])
    })
})
