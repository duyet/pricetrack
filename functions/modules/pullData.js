const functions = require('firebase-functions')
var admin = require('firebase-admin')
const { db, url_parser, hash, collection } = require('../utils')

module.exports = functions
	.runWith({ memory: '1GB', timeoutSeconds: 120 })
	.https
	.onRequest((req, res) => {
		console.log('Start pullData', req.query)
		// TODO: Read config
		// TODO: make a request 
		// TODO: Storage
		const url = req.query.url
		const url_hash = hash(url)
		console.log(`Pull data from ${url}`)

		db.collection(collection.URLS)
			.doc(url_hash)
			.get()
			.then(snapshot => {
				return url_parser(url, json => {
					console.log('Pull result:', json)
					json['datetime'] = new Date()

					db.collection(collection.URLS).doc(url_hash).update({
						last_pull_at: json['datetime']
					})

					// Add raw
					db.collection(collection.RAW_DATA).doc(url_hash).collection('raw').add(json)
					
					// TODO: add hook to aggeration
					db.collection(collection.RAW_DATA).doc(url_hash).update({
						price_series: admin.firestore.FieldValue.arrayUnion({
							price: json.price,
							datetime: json.datetime
						})
					})

					res.json({
						msg: 'ok',
						json
					})
				},
				err => {
					res.status(400).json({err})
				})
			})
			.catch(err => {
				res.status(400).json({
					error: 1,
					url,
					msg: 'URL is not exists in DB'
				})
			})
	})
