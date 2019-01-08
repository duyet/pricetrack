const functions = require('firebase-functions')
const { db, urlParser, normalizeUrl, documentIdFromHashOrUrl, collection, validateToken } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue

module.exports = functions
  .runWith({ memory: '256MB', timeoutSeconds: 60 })
  .https
  .onRequest((req, res) => {
    console.log('Start pullData', req.query)

    let url = String(req.query.url || '')
    url = normalizeUrl(url)

    const token = String(req.query.token || '')
    if (!validateToken(token)) {
      return res.status(403).json({
        status: 403,
        error: 1,
        msg: 'token is invalid!'
      })
    }

    if (!url) {
    	return res.status(400).json({ error: 1, msg: 'url is required!' })
    }

    const urlHash = documentIdFromHashOrUrl(url)
    console.log(`Pulling data from ${url}`)

    db.collection(collection.URLS)
      .doc(urlHash)
      .get()
      .then(snapshot => {
        let data = snapshot.data()
        let raw_count = snapshot.get('raw_count') || 0

        return urlParser(url, json => {
          console.log('Pull result:', json)
          json['datetime'] = FieldValue.serverTimestamp()

          // Update statistic
          db.collection(collection.URLS).doc(urlHash).update({
            last_pull_at: json['datetime'],
            raw_count: raw_count + 1
          })

          // Add raw
          db.collection(collection.RAW_DATA).doc(urlHash).collection('raw').add(json)

          res.json({
            msg: 'ok',
            json
          })
        },
        err => {
          res.status(400).json({ err })
        })
      })
      .catch(err => {
        console.error(err)
        res.status(400).json({
          error: 1,
          url,
          msg: 'URL is not exists in DB'
        })
      })
  })
