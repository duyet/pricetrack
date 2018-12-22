const fetch = require('node-fetch')
const functions = require('firebase-functions');
const { db, functions_url, collection, url_for } = require('../utils');
const CRONJOB_KEY = process.env.CRONJOB_KEY || ''

module.exports = functions.https.onRequest((req, res) => {
	console.log('Start cronjob ...')
	let triggered = []
	if (CRONJOB_KEY) {
		if (!req.query.key || req.query.key !== CRONJOB_KEY) {
			return res.status(400).json({error: 1, msg: 'Cronjob key is not valid: /cronjob?key=<CRONJOB_KEY>'})
		}
	}
	
	db.collection(collection.URLS).get()
	.then(snapshot => {
		snapshot.forEach(doc => {
			let url = doc.get('url')
			let trigger_url = url_for('pullData', {url})
			
			console.log(`Query for ${url}`)
			console.log(`Trigger ${trigger_url}`)
			
			// Start fetch() to trigger
			fetch(trigger_url)
			triggered.push(trigger_url)
		});
		return res.json({triggered})
	})
	.catch(err => {
		console.log("The read failed: ", err)
		return res.status(500).json({
			error: 1,
			err
		})
	})
})