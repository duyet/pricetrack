const functions = require('firebase-functions');
const { db, hash, collection } = require('../utils');

module.exports = functions.https.onRequest((req, res) => {
	// Grab the text parameter.
	const url = req.query.url;

	if (!url) return res.status(500).json({
		status: 400,
		error: 1,
		msg: 'url is required!'
	})

	db.collection(collection.URLS)
		.doc(hash(url))
		.delete()
		.then(snapshot => {
			return res.json(snapshot);
		}).catch(err => {
			return res.status(400).json(err);
		})
});