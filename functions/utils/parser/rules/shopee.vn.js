const { regexProcess } = require('../utils')

module.exports = {
  productId: u => regexProcess(u, /-i\.([0-9]+)\.([0-9]+)/)[2],
  shopId: u => regexProcess(u, /-i\.([0-9]+)\.([0-9]+)/)[1],
  product_api: 'https://shopee.vn/api/v2/item/get?itemid={product_id}&shopid={shop_id}',
  format_func: json => {
    let item = json.item
    let { price, itemid, item_status, is_hot_sales } = item
    return { price, is_deal: is_hot_sales, qty: 0, product_id: itemid, inventory_status: item_status }
  }
}