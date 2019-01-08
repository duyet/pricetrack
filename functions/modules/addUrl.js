const functions = require('firebase-functions')
const { db, isSupportedUrl, documentIdFromHashOrUrl, collection, normalizeUrl } = require('../utils')
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
    let urlDoc = db.collection(collection.URLS).doc(documentIdFromHashOrUrl(url))

    urlDoc.get().then(snapshot => {
        if (snapshot.exists) {
            // Update info
            let data = snapshot.data()
            data['number_of_add'] = (snapshot.get('number_of_add') || 0) + 1
            data['raw_count'] = snapshot.get('raw_count') || 0
            data['last_update_at'] = FieldValue.serverTimestamp()
            data['info'] = info

            urlDoc.set(data, { merge: true }).then(() => {
                data['is_update'] = true
                return res.json(data)
            })

            return true
        }

        urlDoc.set({
                url,
                info,
                number_of_add: 1, // How many time this url is added?
                raw_count: 0,
                created_at: FieldValue.serverTimestamp(),
                last_pull_at: null
            }, { merge: true })
            .then(() => {
                // Response
                urlDoc.get().then(snapshot => res.json(snapshot.data()))
            })
            .catch(err => {
                return res.status(400).json(err)
            })

    })

})