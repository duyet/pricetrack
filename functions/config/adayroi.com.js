const { regexProcess, fetchContent } = require('../utils/parser/utils')
const puppeteer = require('puppeteer')


const adayroiSnippetData = async (params) => {
  const url = `https://www.adayroi.com/abc-p-${params.product_id}`
  const browser = await puppeteer.launch({headless: true, args:['--no-sandbox']});
  const page = await browser.newPage()
  await page.goto(url)

  // Get the "viewport" of the page, as reported by the page.
  const json = await page.evaluate(() => {
    return JSON.parse(document.getElementById('detailSnippet').innerText)
  })

  json['product_id'] = params.product_id

  return json
}

module.exports = {
  website: 'Adayroi',
  domain: 'adayroi.com',
  color: '#189eff',
  logo: 'https://i.imgur.com/e6AX9Lb.png',
  time_check: 15,
  active: true,

  // Get {productId} and {shopId}
  // https://www.adayroi.com/vsmart-active-1-6gb-64gb-den-p-2087332
  productId: u => regexProcess(u, /-p-([0-9]+)/, 1),
  shopId: u => null,
  required: ['productId'],

  product_api: adayroiSnippetData,
  format_func: json => {
    let price = json.offers.price
    let is_deal = false
    let qty = 0
    let product_id = json.product_id
    let inventory_status = ''
    return { price, is_deal, qty, product_id, inventory_status }
  },

  // TODO: rename this attr
  product_info_api: adayroiSnippetData,
  format_product_info: json => {
    let offers = json.offers || {}
    let { name, description, image } = json
    let priceCurrency = offers.priceCurrency
    return { name, description, currency: priceCurrency, image }
  }
}