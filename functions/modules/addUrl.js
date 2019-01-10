const functions = require('firebase-functions')
const { db, isSupportedUrl, documentIdFromHashOrUrl, collection, normalizeUrl, cleanEmail } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue
const { getProductInfoFromUrl } = require('../utils/parser/utils')

module.exports = functions.https.onRequest(async (req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url
    url = normalizeUrl(url)
    
    // TODO: validate email
    let email = cleanEmail(req.query.email)

    if (!email || !url) {
        return res.status(400).json({ err: 1, msg: 'URL and email is required' })
    }

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
            // Subscribe email
            urlDoc.collection(collection.SUBSCRIBE).doc(email).set({
                email,
                active: true,
                create_at: new Date()
            }, { merge: true })

            // Update info
            let data = snapshot.data()
            data['number_of_add'] = (snapshot.get('number_of_add') || 0) + 1
            data['raw_count'] = snapshot.get('raw_count') || 0
            data['last_update_at'] = FieldValue.serverTimestamp()
            data['info'] = info
            urlDoc.set(data, { merge: true }).then(() => {
                data['is_update'] = true
                return res.json({id: snapshot.id, ...data})
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
                // Update Metadata
                let statisticDoc = db.collection(collection.METADATA).doc('statistics')
                statisticDoc.get().then(doc => {
                    const url_count = (doc.data('url_count') || 0) + 1;
                    statisticDoc.set({url_count}, { merge: true })
                })

                // Subscribe email
                urlDoc.collection(collection.SUBSCRIBE).doc(email).set({
                    email,
                    active: true,
                    create_at: new Date()
                }, { merge: true })

                // Response
                urlDoc.get().then(snapshot => res.json({id: snapshot.id, ...snapshot.data()}))
            })
            .catch(err => {
                return res.status(400).json(err)
            })

    })

})