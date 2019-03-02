const {
    httpsFunctions,
    db,
    documentIdFromHashOrUrl,
    collection,
    domainColors,
    getHostname,
    getDeepLink,
    domainLogos,
    resError,
    urlFor
} = require('../utils')

const { text: { URL_NOT_FOUND } } = require('../utils/constants')

module.exports = httpsFunctions.onRequest(async (req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url
    if (!url) return resError(res, URL_NOT_FOUND)

    let urlDoc = db.collection(collection.URLS).doc(documentIdFromHashOrUrl(url))
    urlDoc.get().then(snapshot => {
        if (!snapshot.exists) {
            return res.status(404).json({
                err: 1,
                msg: URL_NOT_FOUND
            })
        }

        let data = snapshot.data()
        data['last_pull_at'] = data['last_pull_at'] ? data['last_pull_at'].toDate() : data['last_pull_at']
        data['color'] = domainColors[getHostname(snapshot.get('url'))]
        data['domain'] = getHostname(snapshot.get('url'))
        data['deep_link'] = getDeepLink(snapshot.get('url'))
        data['redirect'] = urlFor(`redirect/${snapshot.id }`)
        data['id'] = snapshot.id
        data['domain_logo'] = domainLogos[snapshot.get('domain')]

        return res.json(data)
    })

})