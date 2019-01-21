const { regexProcess, fetchContent } = require('../utils/parser/utils')
const { JSDOM } = require('jsdom')

module.exports = {
  website: 'Lazada',
  domain: 'lazada.vn',
  logo: 'https://i.imgur.com/2bm4glz.png',
  color: '#053647',
  time_check: 15,
  active: false,

  // Get {productId} and {shopId}
  productId: u => regexProcess(u, /-i([0-9]+)-/, 1),
  shopId: u => regexProcess(u, /-s([0-9]+)\.html/, 1),
  required: ['productId', 'shopId'],

  product_api: 'https://www.lotte.vn/api/v1/products/{product_id}/detail',
  format_func: json => {
    let price = json.price.VND.default
    let { id, in_stock, on_deal } = json
    return { price, is_deal: on_deal, qty: 0, product_id: id, inventory_status: in_stock }
  },

  product_info_api: async (params) => {
    const url = `https://www.lazada.vn/products/i${params.product_id}-s${params.shop_id}.html`
    const html = await fetchContent(url)
    if (!html) return false

    const dom = new JSDOM(html)

    let currency = 'VND'
    let name = (dom.window.document.querySelector('h1').textContent || '').trim()
    
    let description = ''
    try {
      description = dom.window.document.querySelector('.html-content.pdp-product-highlights').textContent.trim()
      description = description.replace(/\s{2,}/g, ' ')
    } catch (e) {
      console.error(e)
    }

    let image = dom.window.document.querySelector('.item-gallery .gallery-preview-panel__content img').src 

    return {
      name,
      description,
      currency,
      image
    }
  },
  format_product_info: json => json
}