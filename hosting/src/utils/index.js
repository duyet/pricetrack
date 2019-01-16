export function getAccessTradeDeepLink(url) {
    return 'https://fast.accesstrade.com.vn/deep_link/4557459014401077484?url=' + encodeURIComponent(url)
}

export function formatPrice(price, plus_sign = false, currency = 'VND') {
    if (!price) return ''
    return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + currency
}

export function openDeepLink(url) {
    var deepLink = getAccessTradeDeepLink(url)
    if (typeof window !== 'undefined') window.open(deepLink, '_blank')
    return false
}