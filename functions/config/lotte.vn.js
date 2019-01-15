const { regexProcess } = require('../utils/parser/utils')

module.exports = {
  website: 'Lotte',
  domain: 'lotte.vn',
  color: '#f2655c',
  time_check: 15,
  active: true,

  // Get {productId} and {shopId}
  productId: u => regexProcess(u, /\/product\/([0-9]+)\//)[1],
  shopId: u => null,
  required: ['productId'],

  product_api: 'https://www.lotte.vn/api/v1/products/{product_id}/detail',
  format_func: json => {
    let price = json.price.VND.default
    let { id, in_stock, on_deal } = json
    return { price, is_deal: on_deal, qty: 0, product_id: id, inventory_status: in_stock }
  },

  product_info_api: 'https://www.lotte.vn/api/v1/products/{product_id}/detail',
  product_info: json => {
    let image = 'https:' + json.media_gallery.big[0]
    let currency = 'VND'
    const { name, description } = json
    return { name, description, currency, image }
  }
}