const { regexProcess } = require('../utils/parser/utils')
const fetch = require('@zeit/fetch-retry')(require('node-fetch'), {retries: 3})
const { JSDOM } = require('jsdom')

const select = (dom, path, attr) => {
  let item = dom.querySelector(path) || {}
  return item[attr] || ''
}

const getRawHtml = async (params) => {
  const url = params.url
  let res = await fetch(url)
  let html = await res.text()

  if (html.indexOf('meta http-equiv="Refresh') > -1) {
    let newUrl = html.split('0;URL=')[1].split('"')[0]
    const cookies = res.headers.get('set-cookie')
    let res2 = await fetch(newUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_14_3) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/74.0.3729.131 Safari/537.36',
        'Cookie': cookies
      },
    })
    html = await res2.text()
  }

  const dom = new JSDOM(html, {features: {QuerySelector: true}})
  const { document } = dom.window
  
  let json = {
    product_id:   params.productId,
    name:         select(document, '[itemprop="name"]', 'textContent'),
    description:  select(document, '[itemprop="description"]', 'textContent'),
    currency:     select(document, '[itemprop="priceCurrency"]', 'content'),
    availability: select(document, '[itemprop="availability"]', 'href'),
    price:        select(document, `#sec_discounted_price_${params.productId}`, 'textContent'),
    image:        select(document, '[itemprop="image"]', 'src'),
    qty:          '0',
  }

  console.log(`=>`, json)

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