const { regexProcess } = require('../utils')

module.exports = {
  website: 'Tiki',
  domain: 'tiki.vn',
  color: '#189eff',
  time_check: 15,
  productId: u => regexProcess(u, /-p([0-9]+)/)[1],
  shopId: u => null,
  product_api: 'https://tiki.vn/api/v2/products/{product_id}/info',
  product_info_api: 'https://tiki.vn/api/v2/products/{product_id}/info',
  format_func: json => {
    let { price, is_deal, qty, product_id, inventory_status } = json
    return { price, is_deal, qty, product_id, inventory_status }
  },
  product_info: json => json
}