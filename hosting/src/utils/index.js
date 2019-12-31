export function formatPrice(price, plusSign = false, currency = '') {
  if (!price) return '';
  const sign = plusSign && price > 0 ? '+' : '';
  return `${sign + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${currency}`;
}

export function openDeepLink(url) {
  if (typeof window !== 'undefined') window.open(url, '_blank');
  return false;
}
