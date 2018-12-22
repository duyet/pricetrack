const functions = require('firebase-functions')
const { db, functions_url, collection, hash } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
	const url = req.query.url;
	const orderBy = req.query.order && req.query.order == 'desc' ? 'desc' : 'asc'; 
	const field = req.query.field ? req.query.field : 'price'; 
	db
		.collection(collection.RAW_DATA)
		.doc(hash(url))
		.collection('raw')
		.orderBy('datetime', orderBy)
		.get()
		.then(snapshot => {
			if (snapshot.empty) return res.json([])
			else {
				let docs = []
				snapshot.forEach(doc => {
					docs.push(doc.get(field))
				});
				res.json(docs)
			}
		})
		.catch(err => {
			console.log('Error getting documents', err);
			return res.status(400).json([]);
		})
})