const {
    httpsFunctions,
    db,
    getSortKey,
    collection,
    getHostname,
    getDeepLink,
    domainColors,
    domainLogos,
    url_for
} = require('../utils')

module.exports = httpsFunctions.onRequest((req, res) => {
    let startAt = req.query.startAt || null
    let limit = req.query.limit ? parseInt(req.query.limit) : 10
    let helpers = req.query.helper || req.query.helpers ? true : false
    let orderBy = getSortKey(req.query.orderBy)
    let desc = req.query.desc && req.query.desc != 'true' ? 'asc' : 'desc'
    let domain = req.query.domain ? req.query.domain : ''

    let query = db.collection(collection.URLS).orderBy(orderBy, desc)
    if (startAt) {
        console.log('startAt', startAt)
        startAt = new Date(startAt)
        console.log('startAt', startAt)
        query = query.startAfter(startAt)
    }
    if (domain) {
        query = query.where("domain", "==", domain)
    }

    query.limit(limit).get()
        .then(snapshot => {
            var lastVisible = (snapshot.docs && snapshot.docs.length) ?
                snapshot.docs[snapshot.docs.length - 1].get(orderBy).toDate() :
                null

            let urls = []
            snapshot.forEach((doc) => {
                let data = doc.data()

                // TODO: fix invalid url in DB
                if (!doc.get('url')) return

                // List helper urls
                if (helpers === true) {
                    data['helpers'] = {
                        getUrl: url_for('getUrl', {
                            url: doc.get('url')
                        }),
                        pull: url_for('pullData', {
                            url: doc.get('url'),
                            token: 'YOUR_TOKEN'
                        }),
                        raw: url_for('rawData', {
                            url: doc.get('url')
                        }),
                        query: url_for('query', {
                            url: doc.get('url'),
                            limit: 100,
                            fields: 'price'
                        }),
                        remove: url_for('removeUrl', {
                            url: doc.get('url'),
                            token: 'YOUR_TOKEN'
                        }),
                        subscribe: url_for('subscribeUrl', {
                            url: doc.get('url'),
                            email: 'YOUR_EMAIL'
                        }),
                        getSubscriber: url_for('getSubscriber', {
                            url: doc.get('url'),
                            token: 'YOUR_TOKEN'
                        }),
                        updateInfo: url_for('updateInfo', {
                            url: doc.get('url'),
                            token: 'YOUR_TOKEN'
                        })
                    }
                }

                data['id'] = doc.id
                data['current_timestamp'] = new Date()
                data['color'] = domainColors[doc.get('domain')]
                data['deep_link'] = getDeepLink(doc.get('url'))
                data['last_pull_at'] = data['last_pull_at'] ? data['last_pull_at'].toDate() : null
                data['created_at'] = data['created_at'] ? data['created_at'].toDate() : null
                data['last_update_at'] = data['last_update_at'] ? data['last_update_at'].toDate() : null
                data['price_change_at'] = data['price_change_at'] ? data['price_change_at'].toDate() : null
                data['domain_logo'] = domainLogos[doc.get('domain')]

                // Paging
                res.set('next_url', url_for('listUrls', {
                    startAt: lastVisible,
                    limit
                }))
                res.set('nextStartAt', lastVisible)

                urls.push(data)
            })
            return res.json(urls)
        })
        .catch(err => {
            console.log('Error getting documents', err)
            return res.status(400).json([])
        })
})