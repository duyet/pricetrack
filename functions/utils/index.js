const url = require('url')
const normalizeUrl = require('normalize-url')
const querystring = require('querystring')

// The Firebase Admin SDK to access the FireStore DB.
const functions = require('firebase-functions')
const admin = require('firebase-admin')

admin.initializeApp(functions.config().firebase);
var db = admin.firestore();

const functions_url = process.env.FUNCTION_LOCAL
						? `http://localhost:5000/duyet-price-tracker/us-central1`
						: `https://${process.env.FUNCTION_REGION}-${process.env.GCP_PROJECT}.cloudfunctions.net`

const supported_domain = ['tiki.vn']
const collection = {
	URLS: 'urls',
	RAW_DATA: 'raw_data'
}

module.exports = {
	db,
	supported_domain,
	collection,
	functions_url,
	normalizeUrl,
	querystring,
	hash: u => require('crypto').createHash('sha1').update(normalizeUrl(u)).digest('hex'),

	is_supported_url: u => supported_domain.indexOf(url.parse(normalizeUrl(u)).hostname) > -1,
	
	url_parser: require('./parser'),

	url_for: (path, qs) => {
		let query = Object
						.entries(qs)
						.map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
						.join('&')
		return functions_url + '/' + path + '?' + query
	}
}