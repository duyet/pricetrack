const functions = require('firebase-functions')
const { db, functions_url, collection, hash } = require('../utils')

module.exports = functions.https.onRequest((req, res) => {
	const url = req.query.url;
	db
		.collection(collection.RAW_DATA)
		.doc(hash(url))
		.collection('raw')
		.orderBy('datetime', 'desc')
		.get()
		.then(snapshot => {
			if (snapshot.empty) return res.json([])
			else {
				let docs = []
				snapshot.forEach(doc => {
					docs.push(doc.data())
				});
				res.json(docs)
			}
		})
		.catch(err => {
			console.log('Error getting documents', err);
			return res.status(400).json([]);
		})
})