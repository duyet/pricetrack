const fetch = require('node-fetch')
const FieldValue = require('firebase-admin').firestore.FieldValue

const {
    httpsFunctions,
    db,
    isSupportedUrl,
    documentIdFromHashOrUrl,
    collection,
    normalizeUrl,
    urlFor,
    domainOf,
    getConfig,
    getUserFromToken,
    resError
} = require('../utils')
const {
    getProductInfoFromUrl,
    validateUrlPath,
    initProductDataFromUrl
} = require('../utils/parser/utils')

const ADMIN_TOKEN = getConfig('admin_token')

const {
    text: {
        ERR_URL_NOT_SUPPORTED
    }
} = require('../utils/constants')

module.exports = httpsFunctions.onRequest(async (req, res) => {
    // TODO: Add limit, paging
    let url = req.query.url
    const idToken = req.query.idToken
    const authUser = await getUserFromToken(idToken)

    if (!idToken || authUser === null) return resError(res, `Invalid Token`)

    try {
        url = normalizeUrl(url)
    } catch (err) {
        console.error(err)
        return resError(res, ERR_URL_NOT_SUPPORTED)
    }

    // User email
    const email = authUser.email

    // Url is not supported
    if (!isSupportedUrl(url)) return resError(res, ERR_URL_NOT_SUPPORTED)

    // Validate valid url
    if (!validateUrlPath(url)) {
        console.log('validateUrlPath(url)', validateUrlPath(url), url)
        return resError(res, ERR_URL_NOT_SUPPORTED)
    }

    let info = await getProductInfoFromUrl(url) || {}
    let urlDoc = db.collection(collection.URLS).doc(documentIdFromHashOrUrl(url))
    let snapshot = null

    try {
        snapshot = await urlDoc.get()
    } catch (e) {
        console.error(e)
        return resError(res, e)
    }

    let batch = db.batch()

    if (snapshot.exists) {
        console.log('Url exists, subscribe email, update info')
        // Subscribe email
        let subRef = urlDoc.collection(collection.SUBSCRIBE).doc(email)

        // TODO: check exist subscribe
        batch.set(subRef, {
            email,
            active: true,
            create_at: FieldValue.serverTimestamp(),
            expect_when: 'down',
            expect_price: 0,
            methods: 'email'
        }, {
            merge: true
        })

        // Update info
        let data = snapshot.data()
        data['number_of_add'] = (snapshot.get('number_of_add') || 0) + 1
        data['raw_count'] = snapshot.get('raw_count') || 0
        data['last_update_at'] = FieldValue.serverTimestamp()
        data['info'] = info

        batch.set(urlDoc, data, {
            merge: true
        })
        batch.commit().then(() => {
            data['is_update'] = true
            return res.json({
                id: snapshot.id,
                ...data
            })
        })

        return true
    }

    console.log('Url is not exists, fetch new info and init data')

    // New url 
    batch.set(urlDoc, {
        url,
        domain: domainOf(url),
        info,
        number_of_add: 1, // How many time this url is added?
        raw_count: 0,
        created_at: FieldValue.serverTimestamp(),
        last_pull_at: null,
        add_by: email,
    }, {
        merge: true
    })


    // Update Metadata
    try {
        const statisticRef = db.collection(collection.METADATA).doc('statistics')
        const statisticDoc = await statisticRef.get()
        let urlCount = parseInt(statisticDoc.get('url_count') || 0) + 1
        batch.set(statisticRef, { url_count: urlCount }, { merge: true })
    } catch (e) {
        console.error(e)
    }

    // Subscribe email
    console.log(`Subscribe ${email}`)
    batch.set(urlDoc.collection(collection.SUBSCRIBE).doc(email), {
        email,
        active: true,
        expect_when: 'down',
        expect_price: 0,
        methods: 'email',
        create_at: FieldValue.serverTimestamp()
    }, {
        merge: true
    })

    let initData = await initProductDataFromUrl(url)
    console.log('initData', initData)

    // Fetch the first data
    if (initData) {
        initData.map(item => {
            let rawRef = urlDoc.collection(collection.RAW_DATA).doc()
            batch.set(rawRef, item)
        })
    }

    // Commit and fresh pull
    await batch.commit()
    const pullDataUrl = urlFor('pullData', {
        region: 'asia',
        url: url,
        token: ADMIN_TOKEN
    })
    fetch(pullDataUrl)
    console.log(`Fetch the first data ${pullDataUrl}`)

    // Response
    urlDoc.get().then(snapshot => res.json({
        id: snapshot.id,
        ...snapshot.data()
    }))

})