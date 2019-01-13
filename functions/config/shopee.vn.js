const { regexProcess } = require('../utils/parser/utils')

module.exports = {
  website: 'Shopee',
  domain: 'shopee.vn',
  color: '#ff531d',
  time_check: 15,

  // Get {productId} and {shopId}
  productId: u => regexProcess(u, /-i\.([0-9]+)\.([0-9]+)/)[2],
  shopId: u => regexProcess(u, /-i\.([0-9]+)\.([0-9]+)/)[1],

  product_api: 'https://shopee.vn/api/v2/item/get?itemid={product_id}&shopid={shop_id}',
  format_func: json => {
    let item = json.item
    let { price, itemid, item_status, is_hot_sales } = item
    price = price / 100000
    return { price, is_deal: is_hot_sales, qty: 0, product_id: itemid, inventory_status: item_status }
  },

  product_info_api: 'https://shopee.vn/api/v2/item/get?itemid={product_id}&shopid={shop_id}',
  product_info: json => {
    let info = json.item
    let image = `https://cf.shopee.vn/file/${info.images[0]}`
    const { name, description, currency } = info
    return { name, description, currency, image }
  }
}