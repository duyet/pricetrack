const { regexProcess } = require('../utils')

module.exports = {
  productId: u => regexProcess(u, /-p([0-9]+)/)[1],
  shopId: u => null,
  product_api: 'https://tiki.vn/api/v2/products/{product_id}/info',
  format_func: json => {
    let { price, is_deal, qty, product_id, inventory_status } = json
    return { price, is_deal, qty, product_id, inventory_status }
  }
}