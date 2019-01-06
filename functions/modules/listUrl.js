const functions = require('firebase-functions')
const ServerValue = require('firebase-admin').database.ServerValue
const { db, functions_url, collection, url_for, getHostname, domain_colors } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
  db.collection(collection.URLS).orderBy('created_at', 'desc').get()
    .then(snapshot => {
      let urls = []
      snapshot.forEach((doc) => {
        let data = doc.data()
        data['helpers'] = {
          pull: url_for('pullData', { url: doc.get('url') }),
          raw: url_for('rawData', { url: doc.get('url') }),
          query: url_for('query', { url: doc.get('url'), limit: 100, fields: 'price' })
        }
        data['current_timestamp'] = new Date()
        data['domain'] = getHostname(doc.get('url'))
        data['color'] = domain_colors[getHostname(doc.get('url'))]

        urls.push(data)
      })
      return res.json(urls)
    })
    .catch(err => {
      console.log('Error getting documents', err)
      return res.status(400).json([])
    })
})
