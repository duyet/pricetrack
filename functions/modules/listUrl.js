const functions = require('firebase-functions')
const { db, functionsUrl, collection, url_for, getHostname, domain_colors } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
    let startAt = req.query.startAt || null
    let limit = req.query.limit ? parseInt(req.query.limit) : 10

    let query = db.collection(collection.URLS).orderBy('created_at', 'desc')
    if (startAt) query = query.startAfter(startAt)

    query.limit(limit).get()
        .then(snapshot => {
            var lastVisible = snapshot.docs[snapshot.docs.length - 1].get('created_at').toDate()

            let urls = []
            snapshot.forEach((doc) => {
                let data = doc.data()
                data['helpers'] = {
                    pull: url_for('pullData', { url: doc.get('url'), token: 'YOUR_TOKEN' }),
                    raw: url_for('rawData', { url: doc.get('url') }),
                    query: url_for('query', { url: doc.get('url'), limit: 100, fields: 'price' }),
                    remove: url_for('removeUrl', { url: doc.get('url'), token: 'YOUR_TOKEN' })
                }
                data['id'] = doc.id
                data['current_timestamp'] = new Date()
                data['domain'] = getHostname(doc.get('url'))
                data['color'] = domain_colors[getHostname(doc.get('url'))]
                data['last_pull_at'] = data['last_pull_at'] ? data['last_pull_at'].toDate() : null
                data['created_at'] = data['created_at'] ? data['created_at'].toDate() : null
                data['last_update_at'] = data['last_update_at'] ? data['last_update_at'].toDate() : null

                // Paging
                res.set('next_page', url_for('listUrls', { startAt: lastVisible, limit }))

                urls.push(data)
            })
            return res.json(urls)
        })
        .catch(err => {
            console.log('Error getting documents', err)
            return res.status(400).json([])
        })
})