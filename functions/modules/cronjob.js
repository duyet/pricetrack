const fetch = require('node-fetch')
const functions = require('firebase-functions');
const { db, functions_url, collection, url_for } = require('../utils');

module.exports = functions.https.onRequest((req, res) => {
	console.log('Start cronjob ...')
	let triggered = []
	
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