export function formatPrice(price, plus_sign = false, currency = 'VND') {
    if (!price) return ''
    let sign = plus_sign && price > 0 ? '+' : '' 
    return sign + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + ' ' + currency
}

export function openDeepLink(url) {
    if (typeof window !== 'undefined') window.open(url, '_blank')
    return false
}