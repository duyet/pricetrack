const axios = require('axios')

const {
    httpsFunctions,
    getUserFromToken,
    resError,
    getConfig
} = require('../utils')

const {
    text: {
        ERR_EMAIL_REQUIRED,
        ERR_500
    },
    UTM
} = require('../utils/constants')

const accesstradeToken = getConfig('accesstrade_token')
const RATE = parseFloat(getConfig('cashback_rate', 0.5))

module.exports = httpsFunctions.onRequest(async (req, res) => {
    if (!accesstradeToken) return resError(res, ERR_500)
    const authUser = await getUserFromToken(req.query.idToken)
    if (authUser === null) return resError(res, ERR_EMAIL_REQUIRED)
    const email = authUser.email

    let since = req.query.since || '2019-01-01' // TODO: it's mean all data
    if (!since) {
        since = new Date()
        since.setDate(since.getDate() - 1) // Yesterday!
    }

    try {
        const resp = await axios.get('https://api.accesstrade.vn/v1/orders',
            {
                params: {
                    ...UTM,
                    since,
                    utm_content: email,
                    limit: 9999
                },
                headers: {
                    Authorization: `Token ${accesstradeToken}`
                }
            }
        )

        let data = resp.data

        data.data = data.data.map(t => Object.assign(t, { pub_commission: Math.round(t.pub_commission * RATE) }))

        const totalCommission = data.data.filter(t => t.order_success > 0).map(t => t.pub_commission).reduce((a, b) => a + b, 0)

        data = Object.assign(data, { email, totalCommission })

        return res.json(data)
    } catch (e) {
        return resError(res, '' + e)
    }
})