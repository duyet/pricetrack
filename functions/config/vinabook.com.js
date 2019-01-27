const { regexProcess, fetchContent } = require('../utils/parser/utils')
const fetch = require('@zeit/fetch-retry')(require('node-fetch'), {retries: 3})
const { JSDOM } = require('jsdom')

const getRawHtml = async (params) => {
  const url = `https://www.vinabook.com/p-p${params.product_id}.html`
  const req = await fetch(url)
  const html = await req.text()
  const dom = new JSDOM(html, {features: {QuerySelector: true}})
  const { document } = dom.window

  console.log('=================')
  console.log(document.querySelector('[itemprop="name"]'))
  console.log(document.querySelector('[itemprop="priceCurrency"]'))

  let json = {
    product_id:   params.product_id,
    name:         document.querySelector('[itemprop="name"]').textContent        || '',
    description:  document.querySelector('[itemprop="description"]').textContent || '',
    currency:     document.querySelector('[itemprop="priceCurrency"]').content || '',
    availability: document.querySelector('[itemprop="availability"]').href     || '',
    price:        document.querySelector('[itemprop="price"]').textContent       || '',
    image:        document.querySelector('[itemprop="image"]').src             || '',
    qty:          '0',
  }

  console.log(url, `=>`, json)

  return json
}

module.exports = {
  website: 'Vinabook',
  domain: 'vinabook.com',
  color: '#007c36',
  logo: 'https://www.vinabook.com/images/thumbnails/img/252/33/vnb_logo_2x.png',
  time_check: 15,
  active: true,

  // Get {productId} and {shopId}
  // https://www.vinabook.com/leonardo-da-vinci-1-p85106.html
  productId: u => regexProcess(u, /-p([0-9]+)\.html/, 1),
  shopId: u => null,
  required: ['productId'],

  product_api: getRawHtml,
  format_func: json => {
    let price = (json.price || '').replace(/[^0-9]+/g, '')
    let inventory_status = (json.availability || '').indexOf('InStock') > -1 ? true : false
    let qty = (json.qty || '').replace(/[^0-9]+/g, '')
    let product_id = json.product_id
    let is_deal = false

    return { 
      price: parseInt(price) || 0, 
      is_deal, 
      qty: parseInt(qty) || 0, 
      product_id, 
      inventory_status
    }
  },

  product_info_api: getRawHtml,
  format_product_info: json => {
    let { name, description, currency, image } = json
    description = description.replace(/\s+/g, ' ')
    return { name, description, currency, image }
  }
}