const fetch = require('node-fetch')
const functions = require('firebase-functions')
const {
  asiaRegion,
  db,
  pullProductDataFromUrl,
  normalizeUrl,
  documentIdFromHashOrUrl,
  collection,
  validateToken,
  getConfig,
  url_for
} = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue

const {
  text: {
    ERR_MISSING_URL,
    ERR_TOKEN_INVALID
  }
} = require('../utils/constants')

const ADMIN_TOKEN = getConfig('admin_token')

module.exports = functions
  .region(asiaRegion)
  .runWith({
    memory: '512MB',
    timeoutSeconds: 60
  })
  .https
  .onRequest(async (req, res) => {
    let url = String(req.query.url || '')
    url = normalizeUrl(url)

    const token = String(req.query.token || '')
    if (!validateToken(token)) {
      console.error(`[pullData] invalid token: ${token}`)
      return res.status(403).jsonData({
        status: 403,
        error: 1,
        msg: ERR_TOKEN_INVALID
      })
    }

    if (!url) {
      return res.status(400).jsonData({
        error: 1,
        msg: ERR_MISSING_URL
      })
    }

    const urlHash = documentIdFromHashOrUrl(url)
    console.log(`[pullData] START: url=${url} (hash=${urlHash})`)

    let snapshot = null
    let jsonData = null

    try {
      snapshot = await db.collection(collection.URLS).doc(urlHash).get()
    } catch (err) {
      console.error(err)
      return res.status(400).jsonData({
        error: 1,
        url,
        msg: '' + err
      })
    }

    if (!snapshot.exists) {
      console.error(`Trigger not found URL ${url}, urlHash=${urlHash}`)
      return res.status(500).jsonData({
        err: 1
      })
    }

    let raw_count = snapshot.get('raw_count') || 0
    let latest_price = snapshot.get('latest_price') || 0
    let num_price_change = snapshot.get('num_price_change') || 0
    let num_price_change_up = snapshot.get('num_price_change_up') || 0
    let num_price_change_down = snapshot.get('num_price_change_down') || 0

    try {
      jsonData = await pullProductDataFromUrl(url)
    } catch (err) {
      return res.status(400).jsonData({
        error: 1,
        url,
        msg: '' + err
      })
    }

    // Skip if error
    if (!jsonData || !jsonData['price']) {
      return res.status(400).jsonData({
        error: 1,
        url,
        msg: 'Cannot fetch jsonData info'
      })
    }

    console.info(`[pullData] RESULT: ${JSON.stringify(jsonData)}`)

    jsonData['datetime'] = FieldValue.serverTimestamp()
    let new_price = jsonData['price']
    let inventory_status = 'inventory_status' in jsonData ? jsonData['inventory_status'] : ''

    let update_jsonData = {
      last_pull_at: jsonData['datetime'],
      raw_count: raw_count + 1,
      latest_price: new_price,
      inventory_status,
    }

    // Update statistic
    if (latest_price && new_price - latest_price != 0) {
      // Price change in VND and percentage          
      let price_change = new_price - latest_price
      let price_change_percent = (latest_price > 0) ? (100 * price_change / latest_price) : 100

      // Is price up or down?
      let is_price_up = price_change > 0

      // How many time the price change?
      num_price_change = price_change_percent > 0 ? num_price_change + 1 : num_price_change
      num_price_change_up = price_change_percent > 0 ? num_price_change_up + 1 : num_price_change_up
      num_price_change_down = price_change_percent < 0 ? num_price_change_down + 1 : num_price_change_down

      update_jsonData = Object.assign(update_jsonData, {
        // Price change
        latest_price: new_price,
        price_change,
        price_change_percent,
        price_change_at: new Date(),
        is_price_up,
        num_price_change,
        num_price_change_up,
        num_price_change_down,
        is_deal: jsonData['is_deal']
      })

      jsonData['is_change'] = true
    }

    // Update URL info
    db.collection(collection.URLS).doc(urlHash).set(update_jsonData, {
      merge: true
    })

    // Add raw price
    db.collection(collection.URLS).doc(urlHash).collection('raw').add(jsonData)

    // Trigger alert
    if (jsonData.is_change) {
      const alertTriggerUrl = url_for('alert', {
        url: snapshot.get('url'),
        token: ADMIN_TOKEN
      })
      fetch(alertTriggerUrl)
      console.info(`Trigger alert ${alertTriggerUrl}`)
    }

    // Done
    res.json({
      msg: 'ok',
      alert_triggered: !!jsonData.is_change,
      jsonData
    })
  })