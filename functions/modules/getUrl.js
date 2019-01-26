const { httpsFunctions, db, isSupportedUrl, documentIdFromHashOrUrl, 
        collection, normalizeUrl, cleanEmail, domain_colors, getHostname } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue

module.exports = httpsFunctions.onRequest(async (req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url
    if (!url) {
        return res.status(404).json({ err: 1, msg: 'not found.' })
    }

    // TODO: validate email
    let email = cleanEmail(req.query.email)

    let urlDoc = db.collection(collection.URLS).doc(documentIdFromHashOrUrl(url))
    urlDoc.get().then(snapshot => {
        if (!snapshot.exists) {
            return res.status(404).json({ err: 1, msg: 'not found' })
        }

        let data = snapshot.data()
        data['last_pull_at'] = data['last_pull_at'] ? data['last_pull_at'].toDate() : data['last_pull_at']
        data['color'] = domain_colors[getHostname(snapshot.get('url'))]
        data['domain'] = getHostname(snapshot.get('url'))
        data['id'] = snapshot.id

        if (!email) return res.json(data)
        else {
            data['subscribe'] = {}
            snapshot.ref.collection(collection.SUBSCRIBE).doc(email).get().then(snapshotSub => {
                console.info(snapshotSub)
                if (snapshotSub.exists) {
                    data['subscribe'] = snapshotSub.data()
                }

                return res.json(data)
            })
        }
    })

})