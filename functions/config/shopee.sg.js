const { regexProcess } = require('../utils/parser/utils')
const shopeeVN = require('./shopee.vn')

module.exports = {
  ...shopeeVN,
  website: 'Shopee SG',
  domain: 'shopee.sg',
  color: '#ff531d',

  product_api: 'https://shopee.sg/api/v2/item/get?itemid={product_id}&shopid={shop_id}',
  product_info_api: 'https://shopee.sg/api/v2/item/get?itemid={product_id}&shopid={shop_id}',
}