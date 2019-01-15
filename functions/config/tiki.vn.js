const { regexProcess, fetchContent } = require('../utils/parser/utils')
const { JSDOM } = require('jsdom')

module.exports = {
  website: 'Tiki',
  domain: 'tiki.vn',
  color: '#189eff',
  time_check: 15,
  active: true,

  // Get {productId} and {shopId}
  productId: u => regexProcess(u, /-p([0-9]+)/, 1),
  shopId: u => null,
  required: ['productId'],

  product_api: 'https://tiki.vn/api/v2/products/{product_id}/info',
  format_func: json => {
    let { price, is_deal, qty, product_id, inventory_status } = json
    return { price, is_deal, qty, product_id, inventory_status }
  },

  // TODO: rename this attr
  product_info_api: async (params) => {
    const url = `https://tiki.vn/p${params.product_id}.html`
    const html = await fetchContent(url)
    if (!html) return false

    const dom = new JSDOM(html)

    let name = dom.window.document.getElementById('product-name').textContent.trim()
    let description = dom.window.document.getElementsByClassName('top-feature-item')[0].textContent.trim()
    description = description.replace(/\s{2,}/g, ' ')

    return {
      name,
      description,
      currency: 'VND',
      image: ''
    }
  },
  product_info: json => json
}