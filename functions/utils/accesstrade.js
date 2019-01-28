const { getConfig } = require('./config')

const getDeepLink = (url, qs = {utm_source: 'pricetrack'}) => {
    const accesstrade_deeplink_base = getConfig('accesstrade_deeplink_base')
    if (!accesstrade_deeplink_base) {
        console.error('Please set variable: pricetrack.accesstrade_deeplink_base'
                        + ' to use accessTrade Deep link')
        return url
    }

    qs = {
        url,
        ...qs
    }

    let query = Object
      .entries(qs)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&')

    return accesstrade_deeplink_base + '?' + query
}


module.exports = {
    getDeepLink
}