const url = require('url')
const normalizeUrl = require('normalize-url')

// The Firebase Admin SDK to access the FireStore DB.
const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

const supported_domain = ['tiki.vn']
const collection = {
	URLS: 'urls',
	RAW_DATA: 'raw_data'
}

module.exports = {
	db,
	supported_domain,
	collection,
	functions_url: (process.env.FUNCTION_LOCAL
						? `http://localhost:5000/duyet-price-tracker/us-central1`
						: `https://${process.env.FUNCTION_REGION}-${process.env.GCP_PROJECT}.cloudfunctions.net`),

	normalizeUrl,
	hash: u => require('crypto').createHash('sha1').update(normalizeUrl(u)).digest('hex'),

	is_supported_url: u => supported_domain.indexOf(url.parse(normalizeUrl(u)).hostname) > -1,
	
	url_parser: require('./parser')
}