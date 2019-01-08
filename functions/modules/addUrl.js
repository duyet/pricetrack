
const functions = require('firebase-functions')
const { db, isSupportedUrl, hash, collection, normalizeUrl } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue
const { getProductInfoFromUrl } = require('../utils/parser/utils')

module.exports = functions.https.onRequest(async (req, res) => {
  // TODO: Add limit, paging
  let url = req.query.url
  url = normalizeUrl(url)

  if (!isSupportedUrl(url)) {
    return res.status(400).json({
      status: 400,
      error: 1,
      msg: 'Sorry, this url does not supported yet!'
    })
  }

  let info = await getProductInfoFromUrl(url) || {}
  let urlDoc = db.collection(collection.URLS).doc(hash(url))

  urlDoc.get().then(snapshot => {
    if (snapshot.exists) {
      // Update info
      let data = snapshot.data()
      urlDoc.set({info}, { merge: true }).then(() => {
        data['last_update_at'] = new Date()
        data['is_update'] = true
        return res.json(data)
      })
    }

    urlDoc.set({
      url,
      info,
      created_at: FieldValue.serverTimestamp(),
      last_pull_at: null
    }, { merge: true })
    .then(() => {
      urlDoc.get().then(snapshot => res.json(snapshot.data()))
    })
    .catch(err => {
      return res.status(400).json(err)
    })

  })

})
