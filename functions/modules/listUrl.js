const functions = require('firebase-functions')
const { db, functions_url, collection, url_for } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
	db.collection(collection.URLS).get()
	.then(snapshot => {
		let urls = [];
		snapshot.forEach((doc) => {
			let data = doc.data()
			console.log(doc.id, '=>', data);
			data['url'] = {
				pull: url_for('pullData', {url: doc.get('url')}),
				raw: url_for('rawData', {url: doc.get('url')}),
				price_series: url_for('priceSeries', {url: doc.get('url')}),
			}
			urls.push(data)
		});
		return res.json(urls)
	})
	.catch(err => {
		console.log('Error getting documents', err);
		return res.status(400).json([]);
	})});