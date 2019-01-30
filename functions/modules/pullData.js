const fetch = require('node-fetch')
const functions = require('firebase-functions')
const {
  asiaRegion,
  db,
  urlParser,
  normalizeUrl,
  documentIdFromHashOrUrl,
  collection,
  validateToken,
  getConfig,
  url_for
} = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue

const { text: { ERR_MISSING_URL, ERR_TOKEN_INVALID } } = require('../utils/constants')

const ADMIN_TOKEN = getConfig('admin_token')

module.exports = functions
  .region(asiaRegion)
  .runWith({
    memory: '512MB',
    timeoutSeconds: 60
  })
  .https
  .onRequest((req, res) => {
    let url = String(req.query.url || '')
    url = normalizeUrl(url)

    const token = String(req.query.token || '')
    if (!validateToken(token)) {
      console.error(`[pullData] invalid token: ${token}`)
      return res.status(403).json({
        status: 403,
        error: 1,
        msg: ERR_TOKEN_INVALID
      })
    }

    if (!url) {
      return res.status(400).json({
        error: 1,
        msg: ERR_MISSING_URL
      })
    }

    const urlHash = documentIdFromHashOrUrl(url)
    console.log(`Pulling data from ${url}`)

    db.collection(collection.URLS)
      .doc(urlHash)
      .get()
      .then(snapshot => {
        if (!snapshot.exists) {
          console.error(`Trigger not found URL ${url}, urlHash=${urlHash}`)
          return res.status(500).json({
            err: 1
          })
        }

        let raw_count = snapshot.get('raw_count') || 0
        let latest_price = snapshot.get('latest_price') || 0
        let num_price_change = snapshot.get('num_price_change') || 0
        let num_price_change_up = snapshot.get('num_price_change_up') || 0
        let num_price_change_down = snapshot.get('num_price_change_down') || 0

        return urlParser(url, json => {
            console.log('Pull result:', json)

            json['datetime'] = FieldValue.serverTimestamp()
            let new_price = json['price']
            let inventory_status = 'inventory_status' in json ? json['inventory_status'] : ''

            let update_json = {
              last_pull_at: json['datetime'],
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

              update_json = Object.assign(update_json, {
                // Price change
                latest_price: new_price,
                price_change,
                price_change_percent,
                price_change_at: new Date(),
                is_price_up,
                num_price_change,
                num_price_change_up,
                num_price_change_down,
                is_deal: json['is_deal']
              })

              json['is_change'] = true
            }

            // Update URL info
            db.collection(collection.URLS).doc(urlHash).set(update_json, {
              merge: true
            })

            // Add raw price
            db.collection(collection.URLS).doc(urlHash).collection('raw').add(json)

            // Trigger alert
            if ('is_change' in json) {
              const alertTriggerUrl = url_for('alert', {
                url: snapshot.get('url'),
                token: ADMIN_TOKEN
              })
              fetch(alertTriggerUrl)
              console.info(`Trigger alert ${alertTriggerUrl}`)
            }

            res.json({
              msg: 'ok',
              json
            })
          },
          err => {
            res.status(400).json({
              err
            })
          })
      })
      .catch(err => {
        console.error(err)
        res.status(400).json({
          error: 1,
          url,
          msg: '' + err
        })
      })
  })