const functions = require('firebase-functions')
const { db, functions_url, collection } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
	db.collection(collection.URLS).get()
	.then(snapshot => {
		let urls = [];
		snapshot.forEach((doc) => {
			let data = doc.data()
			console.log(doc.id, '=>', data);
			data['url'] = {
				pull: functions_url + '/pullData?url=' + doc.get('url'),
				raw: functions_url + '/rawData?url=' + doc.get('url'),
				price_series: functions_url + '/priceSeries?url=' + doc.get('url')
			}
			urls.push(data)
		});
		return res.json(urls)
	})
	.catch(err => {
		console.log('Error getting documents', err);
		return res.status(400).json([]);
	})});