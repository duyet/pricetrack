const express = require('express')
const {
    httpsFunctions,
    db,
    documentIdFromHashOrUrl,
    collection,
    getDeepLink,
    resError,
} = require('../utils')

const app = express()
app.disable('x-powered-by')

app.get('/:id?', async (req, res) => {
    let urlId = req.params.id || req.query.id
    try {
        let snapshot = await db.collection(collection.URLS)
                             .doc(documentIdFromHashOrUrl(urlId))
                             .get()
        const deepLink = getDeepLink(snapshot.get('url'))
        
        const deeplinkClick = snapshot.get('deeplinkClick') || 0
        snapshot.ref.set({ deeplinkClick: deeplinkClick + 1 }, { merge: true })
        return res.redirect(deepLink)
    } catch (err) {
        return resError(res)
    }
})

module.exports = httpsFunctions.onRequest(app)