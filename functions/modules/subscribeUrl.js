const functions = require('firebase-functions')
const { db, isSupportedUrl, hash, collection, cleanEmail } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue

module.exports = functions.https.onRequest((req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url
    let email = cleanEmail(req.query.email)

    if (!email || !url) {
        return res.status(400).json({ err: 1, msg: 'URL and email is required' })
    }

    const urlDoc = db.collection(collection.URLS).doc(hash(url))
    urlDoc.get().then(docSnapshot => {
        if (docSnapshot.exists) {
            urlDoc.onSnapshot(doc => {
                urlDoc.collection(collection.SUBSCRIBE).doc(email).set({
                        email,
                        active: true,
                        create_at: new Date()
                    }).then(docRef => {
                        console.log(`Added ${email}: ${docRef}`)
                        res.json({ msg: 'ok' })
                    })
                    .catch(error => {
                        console.error("Error writing document: ", error)
                        res.status(400).json(error)
                    })
            })
        } else {
            return res.status(400).json({ err: 1, msg: 'URL is not exist' })
        }
    })
})

