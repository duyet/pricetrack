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
        ERR_URL_NOT_SUPPORTED, 
        ERR_ID_NOT_FOUND
    }
} = require('../utils/constants')

module.exports = httpsFunctions.onRequest(async (req, res) => {
    if (req.method === 'POST') {
        let url = req.body.url
        const idToken = req.body.idToken
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
    
        const deeplinkUrl = getDeepLink(url, {
            utm_source: 'pricetrack',
            utm_campaign: 'cashback',
            utm_content: email
        })
    
        const docId = hashUrl(deeplinkUrl)
        const urlDoc = db.collection(collection.CASHBACK).doc(docId)
        const cashbackUrl = urlFor(`cashback`, { id: docId })
        let snapshot = null
        let cashbackUrlInfo = {}
        try {
            snapshot = await urlDoc.get()
            cashbackUrlInfo = {
                ...snapshot.data(),
                deeplinkUrl,
                cashbackUrl
            }

            // Update if change env
            if (cashbackUrl != snapshot.get('cashbackUrl')) {
                urlDoc.set(cashbackUrlInfo, {
                    merge: true
                })
            }

            assert(snapshot.exists)
            assert(cashbackUrlInfo)
        } catch (e) {
            // Not founds
            cashbackUrlInfo = {
                id: docId,
                url,
                deeplinkUrl,
                cashbackUrl,
                email,
                created_at: FieldValue.serverTimestamp(),
                click: 0
            }
            urlDoc.set(cashbackUrlInfo, {
                merge: true
            })
        }
    
        return res.json(cashbackUrlInfo)
    }

    // Redirect action
    try {
        let cashbackId = req.query.id || ''
        let doc = db.collection(collection.CASHBACK).doc(cashbackId)
        let snapshot = await doc.get()

        // Update counter
        doc.set({
            click: (snapshot.get('click') || 0) + 1
        }, { merge: true })
        
        return res.redirect(snapshot.get('deeplinkUrl'))
    } catch (e) {
        return resError(res, ERR_ID_NOT_FOUND, 404)
    }
})