const assert = require('assert')
const functions = require('firebase-functions')
const {
    asiaRegion,
    db,
    collection,
    domainOf,
    getConfig,
    urlFor,
    resError
} = require('../utils');
const axios = require('axios')

const CRONJOB_KEY = getConfig('cronjob_key')
const ADMIN_TOKEN = getConfig('admin_token')
const WORKER_CUSTOM_DOMAIN = getConfig('worker_custom_domain')

/**
 * List of Cronjobs:
 *
 *   - pullData: every 15 or 30 minutes
 *   - updateInfo: daily
 *   - removeUnsubscriberUrl10: daily
 */

// TODO: split cronjob, continues cronjob

module.exports = functions
    .region(asiaRegion)
    .runWith({
        timeoutSeconds: 120
    })
    .https.onRequest(async (req, res) => {
        let validTask = ['pullData', 'updateInfo', 'patchData'];
        let task = req.query.task || 'pullData';

        if (validTask.indexOf(task) == -1) {
            return resError(res, 'Invalid cronjob task')
        }

        console.log(`Start cronjob task ${task} ...`);

        let triggered = [];
        let tasks = [];
        if (CRONJOB_KEY) {
            if (!req.query.key || req.query.key !== CRONJOB_KEY) {
                return resError(res, 'Cronjob key is not valid: /cronjob?key=<CRONJOB_KEY>')
            }
        }

        let snapshot = null
        try {
            snapshot = await db.collection(collection.URLS).get()
            assert(snapshot != null, "No Data in DB")
        } catch (err) {
            return resError(res, err.message)
        }

        snapshot.forEach(doc => {
            let url = doc.get('url')

            // Fix: remove wrong collection snapshot
            if (!url) {
                console.log(
                    `Document ${doc.id} may be wrong ${doc.data()}, delete it`
                )
                doc.ref.delete()
                return
            }
            // Fix: add missing domain
            if (!doc.get('domain')) {
                let domain = domainOf(url);
                console.info(`Fix: Set domain=${domain} for ${url}`);
                doc.ref.set({
                    domain
                }, {
                    merge: true
                })
            }

            // Trigger url params
            const params = {
                url,
                token: ADMIN_TOKEN,
                region: 'asia'
            }

            // Migrate to VM worker
            if (task === 'pullData' && WORKER_CUSTOM_DOMAIN) {
                params['custom_domain'] = WORKER_CUSTOM_DOMAIN;
            }

            let triggerUrl = urlFor(task, params);
            console.log(`Fetch data for ${url} => triggered ${triggerUrl}`);

            tasks.push(
                axios
                .get(triggerUrl)
                .then(function (response) {
                    console.log(`Trigger ${triggerUrl} success`, response.data);
                    return {
                        success: true,
                        url,
                        data: response.data
                    }
                })
                .catch(function (error) {
                    console.error(`Trigger ${triggerUrl} fail`, error.message);
                    return {
                        success: false,
                        message: error.message,
                        url
                    }
                })
            )
            triggered.push(url)
        })

        // Update counter in Metadata
        let statisticDoc = db.collection(collection.METADATA).doc('statistics')
        try {
            let snapshot = await statisticDoc.get()
            const num = parseInt(
                snapshot.get('num_url_cronjob_triggered') || 0) +
                triggered.length
            statisticDoc.set({ num_url_cronjob_triggered: num }, { merge: true })
        } catch (err) {
            console.error(err)
        }

        // Make sure all trigger pullData has done
        Promise.all(tasks)
            .then(values => {
                res.json({
                    task,
                    triggered,
                    values,
                    triggered_at: new Date()
                });
            })
            .catch(err => {
                console.error('Promise.all fail', err);
                res.json({
                    task,
                    triggered,
                    triggered_at: new Date(),
                    err
                })
            })
    })