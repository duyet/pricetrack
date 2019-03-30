const { regexProcess } = require('../utils/parser/utils')
const fetch = require('@zeit/fetch-retry')(require('node-fetch'), {retries: 3})
const { JSDOM } = require('jsdom')

const getRawHtml = async (params) => {
  const url = params.url
  const req = await fetch(url)
  const html = await req.text()
  const dom = new JSDOM(html, {features: {QuerySelector: true}})
  const { document } = dom.window

  let json = {
    product_id:   params.productId,
    name:         document.querySelector('title').textContent                   || '',
    description:  document.querySelector('[name="description"]').content        || '',
    currency:     'VND',
    availability: null,
    price:        document.querySelector('.main-price-product').textContent     || '',
    image:        document.querySelector('[property="og:image"]').content       || '',
    qty:          0,
  }

  console.log(url, `=>`, json)

  return json
}

module.exports = {
  website: 'Mia.vn',
  domain: 'mia.vn',
  color: '#fc6721',
  logo: 'https://i.imgur.com/mNazZ6p.jpg',
  time_check: 15,
  active: true,

  // Get {productId} and {shopId}
  // https://mia.vn/san-pham/rovigo-revo-bd-20-s-red
  productId: u => regexProcess(u, /san-pham\/(.+)$/, 1),
  shopId: () => null,
  required: ['productId'],

  product_api: getRawHtml,
  format_func: json => {
    let price = 0
    try {
      price = parseInt( (json.price || '').replace(/[^0-9]+/g, '') )
    } catch (e) { console.error(e) }

    let inventoryStatus = price > 0 ? true : false
    let qty = (json.qty || '').replace(/[^0-9]+/g, '')

    return { 
      price: parseInt(price) || 0, 
      is_deal: false, 
      qty: parseInt(qty) || 0, 
      product_id: json.product_id, 
      inventory_status: inventoryStatus
    }
  },

  product_info_api: getRawHtml,
  format_product_info: json => {
    let { name, description, currency, image } = json
    description = description.replace(/\s+/g, ' ')
    return { name, description, currency, image }
  }
}