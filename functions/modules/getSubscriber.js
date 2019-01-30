const {
    httpsFunctions,
    db,
    validateToken,
    hash,
    collection
} = require('../utils')

const { text: { URL_NOT_FOUND, ERR_TOKEN_INVALID } } = require('../utils/constants')

module.exports = httpsFunctions.onRequest((req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url

    const token = String(req.query.token || '')
    if (!validateToken(token)) {
        return res.status(403).json({
            status: 403,
            error: 1,
            msg: ERR_TOKEN_INVALID
        })
    }

    const urlDoc = db.collection(collection.URLS).doc(hash(url))
    urlDoc.get().then(docSnapshot => {
        if (!docSnapshot.exists) {
            return res.status(400).json({
                err: 1,
                msg: URL_NOT_FOUND
            })
        }

        urlDoc.onSnapshot(doc => {
            urlDoc.collection(collection.SUBSCRIBE).get()
                .then(snapshot => {
                    if (!snapshot.exists) {
                        return res.json([])
                    }

                    let emails = []
                    snapshot.forEach(doc => {
                        let data = doc.data()
                        data['create_at'] = doc.get('create_at').toDate()
                        emails.push(data)
                    })
                    return res.json(emails)
                })
        })
    })
})