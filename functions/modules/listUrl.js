const {
    httpsFunctions,
    db,
    getSortKey,
    collection,
    getDeepLink,
    domainColors,
    domainLogos,
    urlFor
} = require('../utils')

module.exports = httpsFunctions.onRequest((req, res) => {
    let startAt = req.query.startAt || null
    let limit = req.query.limit ? parseInt(req.query.limit) : 10
    let helpers = req.query.helper || req.query.helpers ? true : false
    let orderBy = getSortKey(req.query.orderBy)
    let desc = req.query.desc && req.query.desc != 'true' ? 'asc' : 'desc'
    let domain = req.query.domain ? req.query.domain : ''
    let addBy = req.query.add_by ? req.query.add_by : ''
    let following = req.query.following ? true : false
    let followingEmail = req.query.following_email ? req.query.following_email : null

    if (!followingEmail) followingEmail = addBy

    let query = db.collection(collection.URLS).orderBy(orderBy, desc)
    if (startAt) {
        console.log('startAt', startAt)
        startAt = new Date(startAt)
        console.log('startAt', startAt)
        query = query.startAfter(startAt)
    }
    if (domain) query = query.where("domain", "==", domain)
    if (addBy) query = query.where("add_by", "==", addBy)  

    query.limit(limit).get()
        .then(async (snapshot) => {
            // Last item for next paging
            var lastVisible = (snapshot.docs && snapshot.docs.length) ?
                snapshot.docs[snapshot.docs.length - 1].get(orderBy).toDate() :
                null

            // Paging
            res.set('next_url', urlFor('listUrls', {
                startAt: lastVisible,
                limit
            }))
            res.set('nextStartAt', lastVisible)

            let urls = []
            for (var i in snapshot.docs) {
                const doc = snapshot.docs[i]

                // TODO: fix invalid url in DB
                if (!doc.get('url')) continue

                // Filter following
                if (following) {
                    try {
                        const subscribe = await doc.ref.collection(`subscribe`).doc(followingEmail).get()
                        if (String(subscribe.get('active')) === 'false') throw Error('Not active')
                    } catch (e) {
                        continue
                    }
                }

                let data = doc.data()

                // List helper urls
                if (helpers === true) {
                    data['helpers'] = {
                        getUrl: urlFor('getUrl', {
                            url: doc.get('url')
                        }),
                        pull: urlFor('pullData', {
                            url: doc.get('url'),
                            token: 'YOUR_TOKEN'
                        }),
                        raw: urlFor('rawData', {
                            url: doc.get('url')
                        }),
                        query: urlFor('query', {
                            url: doc.get('url'),
                            limit: 100,
                            fields: 'price'
                        }),
                        remove: urlFor('removeUrl', {
                            url: doc.get('url'),
                            token: 'YOUR_TOKEN'
                        }),
                        subscribe: urlFor('subscribeUrl', {
                            url: doc.get('url'),
                            email: 'YOUR_EMAIL'
                        }),
                        getSubscriber: urlFor('getSubscriber', {
                            url: doc.get('url'),
                            token: 'YOUR_TOKEN'
                        }),
                        updateInfo: urlFor('updateInfo', {
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

                urls.push(data)
            }

            return res.json(urls)
        })
        .catch(err => {
            console.log('Error getting documents', err)
            return res.status(400).json([])
        })
})