const { httpsFunctions, db, isSupportedUrl, documentIdFromHashOrUrl,
        collection, normalizeUrl, cleanEmail } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue
const { getProductInfoFromUrl, validateUrlPath } = require('../utils/parser/utils')

module.exports = httpsFunctions.onRequest(async (req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url
    url = normalizeUrl(url)
    
    if (!url) {
        return res.status(400).json({ err: 1, msg: 'URL is required' })
    }

    let urlDoc = db.collection(collection.URLS).doc(documentIdFromHashOrUrl(url))
    let info = await getProductInfoFromUrl(url) || null
        
    urlDoc.get().then(snapshot => {
        if (!snapshot.exists) {
            return res.status(400).json({
                err: 1,
                msg: 'URL is not exists'
            })
        }

        if (!info) {
            return res.status(400).json({
                err: 1,
                msg: 'Cannot fetch info'
            }) 
        }

        // Update info
        let data = snapshot.data()
        info['last_update_at'] = FieldValue.serverTimestamp()

        urlDoc.set({ info }, { merge: true }).then(() => {
            data['is_update'] = true
            return res.json({id: snapshot.id, ...data})
        })
    })

})