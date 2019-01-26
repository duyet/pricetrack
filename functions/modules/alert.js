const { httpsFunctions, db, documentIdFromHashOrUrl, 
        collection, validateToken } = require('../utils')

const triggerNoti = async (req, res) => {
    let url = req.query.url
    const token = String(req.query.token || '')
    if (!validateToken(token)) {
      return res.status(403).json({
        status: 403,
        error: 1,
        msg: 'token is invalid!'
      })
    }

    if (!url ) {
        return res.status(400).json({ err: 1, msg: 'URL is required' })
    }

    let urlHash = documentIdFromHashOrUrl(url) 
    const urlDoc = db.collection(collection.URLS).doc(urlHash)
    urlDoc.get().then(urlSnapshot => {
        if (!urlSnapshot.exists) {
            console.error(`Trigger but url not found: url=${url} token=${token}`)
            return res.status(403).json({ err: 1, msg: 'URL not found' })
        }
        
        const urlData = urlSnapshot.data()
        urlData['id'] = urlSnapshot.id

        if (!urlData.price_change) {
            console.error(`Trigger when price is not changed, url=${url} urlData=${urlData} token=${token}`)
            return res.status(500).json({ err: 1, msg: 'Price not change' })
        }

        urlDoc.collection(collection.SUBSCRIBE)
              .get()
              .then(snapshot => {
                triggerInfo = []

                snapshot.forEach(doc => {
                    let alertUser = doc.data()

                    // This user not active
                    if (!doc.get('active')) {
                        triggerInfo.push({
                            alertUser,
                            triggered: false,
                            reason: 'this user not active'
                        })
                        return false
                    }

                    // Expect down, but price up
                    if (doc.get('expect_when') == 'down' && urlData.is_price_up == true) {
                        triggerInfo.push({
                            alertUser,
                            triggered: false,
                            reason: 'Expect down, but the price is up'
                        })
                        return false
                    }

                    // Not meet expect price
                    if (doc.get('expect_price') > 0 && urlData.latest_price > doc.get('expect_price')) {
                        triggerInfo.push({
                            alertUser,
                            triggered: false,
                            reason: `Expect ${doc.get('expect_price')}, but the price is ${urlData.latest_price}`
                        })
                        return false
                    }

                    // OK, fine!
                    let send_to = alertUser.email
                    let params = {...urlData}

                    if (!alertUser.methods) {
                        console.error(`No alert provider method ${JSON.stringify(alertUser)}`)
                        triggerInfo.push({
                            alertUser,
                            triggered: false,
                            reason: `No alert method`
                        })
                        return false
                    }

                    const triggerProvider = require(`./alertProvider/${alertUser.methods}`)
                    triggerInfo.push({
                        alertUser,
                        triggered: triggerProvider(alertUser.email, params)
                    })
                })

                return res.json(triggerInfo)
            })
        })
}

module.exports = httpsFunctions.onRequest(triggerNoti)