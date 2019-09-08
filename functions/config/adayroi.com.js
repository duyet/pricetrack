const fetch = require('@zeit/fetch-retry')(require('node-fetch'), {retries: 3})
const { JSDOM } = require('jsdom')

const { regexProcess } = require('../utils/parser/utils')
const { initDataJajum } = require('../utils/fetch')


const adayroiSnippetData = async (params) => {

  const url = params.url
  const req = await fetch(url)
  const html = await req.text()
  const dom = new JSDOM(html, {features: {QuerySelector: true}})
  const { document } = dom.window

  let json = {
    product_id:   params.productId,
    name:         document.querySelector('title').textContent                   || '',
    description:  (document.querySelector('[name="description"]') || {}).content        || '',
    currency:     'VND',
    availability: null,
    price:        (document.querySelector('.price-info__sale') || {}).textContent     || '',
    image:        (document.querySelector('[property="og:image"]') || {}).content       || '',
    qty:          0,
  }

  console.info(json)

  return json
  
}

module.exports = {
  website: 'Adayroi',
  domain: 'adayroi.com',
  color: '#189eff',
  logo: 'https://i.imgur.com/e6AX9Lb.png',
  time_check: 15,
  active: false,

  // Get {productId} and {shopId}
  // https://www.adayroi.com/vsmart-active-1-6gb-64gb-den-p-2087332
  productId: u => regexProcess(u, /-p-([A-Z]*([0-9]+))/, 1),
  shopId: u => null,
  required: ['productId'],

  product_api: adayroiSnippetData,
  format_func: json => {
    let price = 0
    try {
      price = parseInt( (json.price || '').replace(/[^0-9]+/g, '') )
    } catch (e) { console.error(e) }

    let is_deal = false
    let qty = 0
    let inventory_status = price > 0 ? true : false
    return { ...json, price, is_deal, qty, inventory_status }
  },

  // TODO: rename this attr
  product_info_api: adayroiSnippetData,
  format_product_info: json => {
    let { name, description, image } = json
    let priceCurrency = 'VND'
    return { name, description, currency: priceCurrency, image }
  },

  init_data: async params => initDataJajum('adayroi.com', params)
}