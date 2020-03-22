
const { fetchContent } = require('../utils/parser/utils')
const { JSDOM } = require('jsdom')

const initDataJajum = async (domain, params) => {
    const url = `https://jajum.com/products/${domain}/-p${params.product_id}`
    console.log(`fetch data from ${url}`)
    let html = await fetchContent(url)
    if (!html) return null
    const dom = new JSDOM(html)

    let scripts = dom.window.document.querySelectorAll('script')
    for (let script of scripts) {
      let content = script.textContent
      if (content && content.indexOf('datasets') > -1) {
        content = content.split(`"data":`)[1].split(`,"borderColor"`)[0]
        content = JSON.parse(content)
        console.log(content)

        let raw = content.map(row => {
          return { datetime: new Date(row.x), price: row.y }
        })

        return raw
      }
    }
    return null
}

module.exports = {
    initDataJajum
}