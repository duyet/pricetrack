const functions = require('firebase-functions')
const { db, url_parser, hash, collection } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue

module.exports = functions
  .runWith({ memory: '256MB', timeoutSeconds: 120 })
  .https
  .onRequest((req, res) => {
    console.log('Start pullData', req.query)
    // TODO: Read config
    // TODO: make a request
    // TODO: Storage
    const url = req.query.url
    if (!url) {
    	return res.status(400).json({ error: 1, msg: 'url is required!' })
    }

    const url_hash = hash(url)
    console.log(`Pull data from ${url}`)

    db.collection(collection.URLS)
      .doc(url_hash)
      .get()
      .then(snapshot => {
        return url_parser(url, json => {
          console.log('Pull result:', json)
          json['datetime'] = FieldValue.serverTimestamp()

          db.collection(collection.URLS).doc(url_hash).update({
            last_pull_at: json['datetime']
          })

          // Add raw
          db.collection(collection.RAW_DATA).doc(url_hash).collection('raw').add(json)

          // TODO: add hook to aggeration
          // db.collection(collection.RAW_DATA).doc(url_hash).set({
          // 	price_series: FieldValue.arrayUnion({
          // 		price: json.price,
          // 		datetime: json.datetime
          // 	})
          // })

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
