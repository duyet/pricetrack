const functions = require('firebase-functions');
const { db, functions_url, collection } = require('../utils');

module.exports = functions.https.onRequest((req, res) => {
	console.log('Start cronjob ...')
	let tasks = []
	
	db.collection(collection.URLS).get()
	.then(snapshot => {
		snapshot.forEach((doc) => {
			let url = doc.get('url')
			let trigger_url = `${functions_url}/pullData?url=${url}`
			
			console.log(`Query for ${url}`)
			console.log(`Trigger ${trigger_url}`)
			
			// Start fetch() to trigger
			fetch(trigger_url)
			tasks.push(trigger_url)
		});
		return res.json({tasks})
	})
	.catch(err => {
		console.log("The read failed: " + err.code)
		return res.status(500).json({
			error: 1,
			err
		})
	})
})