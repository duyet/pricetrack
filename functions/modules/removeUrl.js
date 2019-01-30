const {
  httpsFunctions,
  db,
  documentIdFromHashOrUrl,
  collection,
  validateToken
} = require('../utils')

const { text: { URL_NOT_FOUND, ERR_TOKEN_INVALID } } = require('../utils/constants')

module.exports = httpsFunctions.onRequest((req, res) => {
  const url = String(req.query.url || '')
  const token = String(req.query.token || '')

  if (!validateToken(token)) {
    return res.status(403).json({
      status: 403,
      error: 1,
      msg: ERR_TOKEN_INVALID
    })
  }

  if (!url) {
    return res.status(400).json({
      status: 400,
      error: 1,
      msg: URL_NOT_FOUND
    })
  }

  const urlHash = documentIdFromHashOrUrl(url)
  db.collection(collection.URLS)
    .doc(urlHash)
    .delete()
    .then(snapshot => {
      // Update counter in Metadata
      let statisticDoc = db.collection(collection.METADATA).doc('statistics')
      statisticDoc.get().then(doc => {
        const url_count = parseInt(doc.get('url_count') || 0) - 1;
        statisticDoc.set({
          url_count
        }, {
          merge: true
        })
      })

      return res.json(snapshot)
    }).catch(err => {
      return res.status(400).json(err)
    })
})