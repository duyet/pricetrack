const FieldValue = require('firebase-admin').firestore.FieldValue
const assert = require('assert')

const {
    httpsFunctions,
    db,
    isSupportedUrl,
    hashUrl,
    collection,
    normalizeUrl,
    getUserFromToken,
    resError,
    getDeepLink,
    urlFor
} = require('../utils')
const {
    validateUrlPath,
} = require('../utils/parser/utils')

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

    const cashbackUrl = getDeepLink(url, {
        utm_source: 'pricetrack',
        utm_campaign: 'cashback',
        utm_content: email
    })

    const docId = hashUrl(cashbackUrl)
    const urlDoc = db.collection(collection.CASHBACK).doc(docId)
    let snapshot = null
    let cashbackUrlInfo = {}
    try {
        snapshot = await urlDoc.get()
        cashbackUrlInfo = snapshot.data()
        assert(snapshot.exists)
        assert(cashbackUrlInfo)
    } catch (e) {
        // Not founds
        cashbackUrlInfo = {
            id: docId,
            url,
            cashbackUrl,
            shortenUrl: urlFor(`cashback`, { id: docId }),
            email,
            create_at: FieldValue.serverTimestamp(),
            click: 0
        }
        urlDoc.set(cashbackUrlInfo, {
            merge: true
        })
    }

    return res.json(cashbackUrlInfo)
})