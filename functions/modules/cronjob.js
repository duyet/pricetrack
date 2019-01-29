const functions = require('firebase-functions')
const {
    asiaRegion,
    db,
    collection,
    domainOf,
    getConfig,
    fetchRetry,
    url_for
} = require('../utils')

const CRONJOB_KEY = getConfig('cronjob_key')
const ADMIN_TOKEN = getConfig('admin_token')

/**
 * List of Cronjobs:
 *
 *   - pullData: every 15 or 30 minutes
 *   - updateInfo: daily
 *   - removeUnsubscriberUrl10: daily
 */

module.exports = functions
    .region(asiaRegion).runWith({
        timeoutSeconds: 120
    })
    .https
    .onRequest((req, res) => {
    let validTask = ['pullData', 'updateInfo']
    let task = req.query.task || 'pullData'

    if (!task || validTask.indexOf(task) == -1) {
        return res.status(400).json({
            err: 1,
            msg: 'Invalid cronjob task'
        })
    }

    console.log(`Start cronjob task ${task} ...`)

    let triggered = []
    let tasks = []
    if (CRONJOB_KEY) {
        if (!req.query.key || req.query.key !== CRONJOB_KEY) {
            return res.status(400).json({
                error: 1,
                msg: 'Cronjob key is not valid: /cronjob?key=<CRONJOB_KEY>'
            })
        }
    }

    db.collection(collection.URLS).get()
        .then(snapshot => {
            snapshot.forEach(doc => {
                let url = doc.get('url')

                // Fix: remove wrong collection snapshot
                if (!url) {
                    console.log(`Document ${doc.id} may be wrong ${doc.data()}, delete it`)
                    doc.ref.delete()
                    return
                }
                // Fix: add missing domain
                if (!doc.get('domain')) {
                    let domain = domainOf(url)
                    console.info(`Fix: Set domain=${domain} for ${url}`)
                    doc.ref.set({
                        domain
                    }, {
                        merge: true
                    })
                }

                let triggerUrl = url_for(task, {
                    url,
                    token: ADMIN_TOKEN
                })
                console.log(`Fetch data for ${url} => triggered ${triggerUrl}`)

                // Start fetch()
                tasks.push(
                    fetchRetry(triggerUrl, {})
                        .then(res => res.json())
                        .then(json => console.log(`Trigger pullData ${triggerUrl}: ${JSON.stringify(json)}`))
                        .catch(err => console.error(`Fail trigger ${triggerUrl}: ${JSON.stringify(err)}`))
                )
                triggered.push(url)
            })

            // Update counter in Metadata
            let cronjobLogs = db.collection(collection.METADATA)
                .doc('statistics')
                .collection(collection.CRONJOB_LOGS)
            
            // Add cronjob logs
            cronjobLogs.add({
                num_triggered: triggered.length,
                triggered,
                task
            }).then(doc => {
                // Update cronjob counter
                let statisticDoc = db.collection(collection.METADATA).doc('statistics')
                statisticDoc.get().then(doc => {
                    const num_url_cronjob_triggered = parseInt(doc.get('num_url_cronjob_triggered') || 0) + triggered.length;
                    statisticDoc.set({
                        num_url_cronjob_triggered
                    }, {
                        merge: true
                    })
                })
            })

            // Make sure all trigger pullData has done
            Promise.all(tasks)

            // Return result
            return res.json({
                task,
                triggered,
                triggered_at: new Date()
            })
        })
        .catch(err => {
            console.log('The read failed: ', err)
            return res.status(500).json({
                error: 1,
                err
            })
        })
})