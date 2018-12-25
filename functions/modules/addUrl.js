
const functions = require('firebase-functions')
const { db, is_supported_url, hash, collection, normalizeUrl } = require('../utils')
const FieldValue = require('firebase-admin').firestore.FieldValue

module.exports = functions.https.onRequest((req, res) => {
	// TODO: Add limit, paging
	let url = req.query.url
	url = normalizeUrl(url) // TODO: fix this normalize, remove url params

	if (!is_supported_url(url)) {
		return res.status(400).json({
			status: 400, 
			error:1, 
			msg: 'Sorry, this url does not supported yet!'
		})
	}

	let urlDoc = db.collection(collection.URLS).doc(hash(url));
	let setUrl = urlDoc.set({
		url: url,
		created_at: FieldValue.serverTimestamp(),
		last_pull_at: null
	}, {
		merge: true
	});

	setUrl.then(snapshot => {
		return res.json(snapshot);
	}).catch(err => {
		return res.status(400).json(err);
	})
})