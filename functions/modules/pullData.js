/* eslint-disable require-atomic-updates */
const assert = require('assert')
const fetch = require('node-fetch')
const functions = require('firebase-functions')
const {
  asiaRegion,
  db,
  pullProductDataFromUrl,
  documentIdFromHashOrUrl,
  collection,
  validateToken,
  getConfig,
  urlFor,
  resError
} = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue
const Timestamp = require('firebase-admin').firestore.Timestamp

const {
  text: {
    ERR_MISSING_URL,
    ERR_TOKEN_INVALID
  }
} = require('../utils/constants')

const ADMIN_TOKEN = getConfig('admin_token')
const WORKER_CUSTOM_DOMAIN = getConfig('worker_custom_domain')
const ONE_HOUR = 3600000

let snapshotCache = {}
const sleep = require('util').promisify(setTimeout)

module.exports.onRequest = async (req, res) => {
  const token = String(req.query.token || '')
  if (!validateToken(token)) {
    console.error(`[pullData] invalid token: ${token}`)
    return resError(res, ERR_TOKEN_INVALID, 403)
  }

  let url = String(req.query.url || '')
  if (!url) return resError(res, ERR_MISSING_URL)

  const urlHash = documentIdFromHashOrUrl(url)
  console.log(`[pullData] START: url=${url} (hash=${urlHash})`)

  let snapshot = null
  let jsonData = null

  // Fetch current url info
  try {
    if (snapshotCache[urlHash]) {
      snapshot = snapshotCache[urlHash]
    } else {
      snapshot = await db.collection(collection.URLS).doc(urlHash).get()

      // Validate
      assert(snapshot != null)
      assert(snapshot.exists === true)

      let isActive = snapshot.get('is_active') || true
      assert(isActive === true)

      // Cache to reduce number of request to DB
      snapshotCache[urlHash] = snapshot
    }
  } catch (err) {
    console.error(err)
    return resError(res, err.message, 500)
  }

  // Fetch remote data
  try {
    jsonData = await pullProductDataFromUrl(url)
    assert(jsonData != null, 'Cannot fetch remote data')
    assert(jsonData['price'] != null, 'Price data is not found')
    console.info(`[pullData] RESULT: ${JSON.stringify(jsonData)}`)
  } catch (err) {
    console.error(err)
    return resError(res, err.message, 500)
  }

  let raw_count = snapshot.get('raw_count') || 0
  let latest_price = snapshot.get('latest_price') || 0
  let num_price_change = snapshot.get('num_price_change') || 0
  let num_price_change_up = snapshot.get('num_price_change_up') || 0
  let num_price_change_down = snapshot.get('num_price_change_down') || 0
  let lastestAppendRaw = snapshot.get('lastest_append_raw')
    ? snapshot.get('lastest_append_raw')
    : Timestamp.now()
  let currentRawCount = snapshot.get('raw_count') || 0


  jsonData['datetime'] = FieldValue.serverTimestamp()
  let new_price = jsonData['price']
  let inventory_status = 'inventory_status' in jsonData ? jsonData['inventory_status'] : ''

  let updateInfoData = {
    last_pull_at: jsonData['datetime'],
    raw_count: raw_count + 1,
    latest_price: new_price,
    inventory_status
  }

  // Update statistic
  if (latest_price !== 0 && new_price - latest_price !== 0) {
    // Price change in VND and percentage
    let price_change = new_price - latest_price
    let price_change_percent = (latest_price > 0) ? (100 * price_change / latest_price) : 100

    // Is price up or down?
    let is_price_up = price_change > 0

    // How many time the price change?
    num_price_change = price_change_percent > 0 ? num_price_change + 1 : num_price_change
    num_price_change_up = price_change_percent > 0 ? num_price_change_up + 1 : num_price_change_up
    num_price_change_down = price_change_percent < 0 ? num_price_change_down + 1 : num_price_change_down

    updateInfoData = Object.assign(updateInfoData, {
      latest_price: new_price,
      price_change,
      price_change_percent,
      price_change_at: Timestamp.now(),
      is_price_up,
      num_price_change,
      num_price_change_up,
      num_price_change_down,
      is_deal: jsonData['is_deal']
    })
    jsonData = Object.assign(jsonData, { is_change: true })
  }

  // inventory_status change
  if (jsonData['inventory_status'] != snapshot.get('inventory_status')) {
    updateInfoData = Object.assign(updateInfoData, {
      is_inventory_status_change: true,
      is_change: true
    })
    jsonData = Object.assign(jsonData, { is_change: true })
  }

  // Update lastest_append_raw_at
  if (!snapshot.get('lastest_append_raw') || Timestamp.now().toMillis() - lastestAppendRaw.toMillis() > ONE_HOUR) {
    updateInfoData = Object.assign(updateInfoData, { lastest_append_raw: Timestamp.now() })
  }

  // Update URL info
  await db.collection(collection.URLS).doc(urlHash).set(updateInfoData, {
    merge: true
  })

  // Only add new Raw when changed or last_append_raw > 1h
  if (jsonData['is_change']
    || !snapshot.get('lastest_append_raw')
    || Timestamp.now().toMillis() - lastestAppendRaw.toMillis() > ONE_HOUR
    || currentRawCount < 2) {
    console.log('Save new raw data (> 1hour) or raw_count < 2',
      Timestamp.now().toMillis() - lastestAppendRaw.toMillis())
    db.collection(collection.URLS).doc(urlHash).collection('raw').add(jsonData)
  }

  // Trigger alert if is_change
  if (updateInfoData.is_change && currentRawCount > 1) {
    (async () => {
      await sleep(1000)

      const alertTriggerUrl = urlFor('alert', {
        url: snapshot.get('url'),
        token: ADMIN_TOKEN,
        custom_domain: WORKER_CUSTOM_DOMAIN
      })
      fetch(alertTriggerUrl)
      console.info(`Trigger alert ${alertTriggerUrl}`)
      // Done
      res.json({
        msg: 'ok',
        alert_triggered: !!jsonData.is_change,
        jsonData
      })
    })()

    return true
  }

  // Done
  res.json({
    msg: 'ok',
    alert_triggered: !!jsonData.is_change,
    jsonData
  })
}

module.exports.functions = functions
  .region(asiaRegion)
  .runWith({
    memory: '512MB',
    timeoutSeconds: 30
  })
  .https
  .onRequest(module.exports.onRequest)
