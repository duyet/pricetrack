const path = require('path')
const {
    httpsFunctions,
    db,
    documentIdFromHashOrUrl,
    collection,
    validateToken,
    resError
} = require('../utils')

const {
    text: {
        ERR_MISSING_URL,
        ERR_TOKEN_INVALID,
    }
} = require('../utils/constants')

const triggerNoti = async (req, res) => {
    const token = String(req.query.token || '')
    if (!validateToken(token)) {
        console.error(`[pullData] invalid token: ${token}`)
        return resError(res, ERR_TOKEN_INVALID, 403)
    }

    let url = String(req.query.url || '')
    if (!url) return resError(res, ERR_MISSING_URL)

    const urlHash = documentIdFromHashOrUrl(url)
    console.log(`[Alert] START: url=${url} (hash=${urlHash})`)

    const urlDoc = db.collection(collection.URLS).doc(urlHash)
    let urlSnapshot = await urlDoc.get()

    if (!urlSnapshot.exists) {
        console.error(`Trigger but url not found: url=${url} token=${token}`)
        return resError(res, ERR_MISSING_URL)
    }

    let urlData = urlSnapshot.data()
    urlData['id'] = urlSnapshot.id
    console.log(urlData)

    if (!urlData.is_change) {
        console.error(`Trigger when price is not changed, url=${url} urlData=${JSON.stringify(urlData)} token=${token}`)
        return resError(res, 'Price not change')
    }

    const subscribers = await urlDoc.collection(collection.SUBSCRIBE).get()
    let triggerInfo = []

    for (var i in subscribers.docs) {
        const subscriber = subscribers.docs[i]
        let alertUser = subscriber.data()

        // This user not active
        if (!subscriber.get('active') || !subscriber.get('expect_when')) {
            triggerInfo.push({
                alertUser,
                triggered: false,
                reason: 'this user not active'
            })
            continue
        }

        // Expect down, but price up
        if (subscriber.get('expect_when') == 'down' && urlData.is_price_up == true) {
            triggerInfo.push({
                alertUser,
                triggered: false,
                reason: 'Expect down, but the price is up'
            })
            continue
        }

        // Not meet expect price
        const expectPrice = parseInt(subscriber.get('expect_price'))
        if (subscriber.get('expect_when') == 'down_below'
            && expectPrice > 0
            && urlData.latest_price > expectPrice) {
            triggerInfo.push({
                alertUser,
                triggered: false,
                reason: `Expect ${expectPrice}, but the price is ${urlData.latest_price}`
            })
            continue
        }

        // TODO: is_inventory_status_change
        if (subscriber.get('expect_when') == 'available'
            && (urlData.is_inventory_status_change == false || urlData.inventory_status == false)) {
            triggerInfo.push({
                alertUser,
                triggered: false,
                reason: `Expect when product is available, but the status is not change`
                    + ` or inventory_status expect = true (fact: ${urlData.inventory_status})`
            })
            continue
        }

        // OK, fine!
        let params = { ...urlData, ...subscriber.data() }

        if (!alertUser.methods) {
            console.error(`No alert provider method ${JSON.stringify(alertUser)}`)
            triggerInfo.push({
                alertUser,
                triggered: false,
                reason: `No alert method`
            })
            continue
        }

        // Support multi methods
        let methods = !Array.isArray(alertUser.methods) ? alertUser.methods.split(',') : alertUser.methods
        for (let method of methods) {
            const triggerProvider = require(path.resolve(__dirname, `alertProvider`, method))
            triggerInfo.push({
                alertUser,
                triggered: await triggerProvider(alertUser.email, params)
            })
        }
    }

    console.log(triggerInfo)
    return res.json(triggerInfo)
}

module.exports = httpsFunctions.onRequest(triggerNoti)