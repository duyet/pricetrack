const url = require('url')
const fetch = require('node-fetch')

// const supported_domain = require('./index').supported_domain
const supported_domain = ['tiki.vn', 'shopee.vn']

const parse_config = {
	'tiki.vn': {
		productId: u => regexProcess(u, /-p([0-9]+)/)[1],
		shopId: u => null,
		product_api: 'https://tiki.vn/api/v2/products/{product_id}/info',
		format_func: json => json
	},
	'shopee.vn': {
		productId: u => regexProcess(u, /-i\.([0-9]+)\.([0-9]+)/)[2],
		shopId: u => regexProcess(u, /-i\.([0-9]+)\.([0-9]+)/)[1],
		product_api: 'https://shopee.vn/api/v2/item/get?itemid={product_id}&shopid={shop_id}',
		format_func: json => json
	}
}

const getProvider = u => url.parse(u).hostname

const regexProcess = (u, regex) => {
	console.log(`Parse ${u} with regex ${regex}`)
	const provider = getProvider(u)
	const pathname = url.parse(u).pathname
	const parsePathname = pathname.match(regex)
	
	return parsePathname
}

const parseUrlWithConfig = (u, config, cb, cb_error) => {
	const product_id = config.productId(u)
	const shop_id = config.shopId(u)
	const product_api  = config.product_api
									.replace('{product_id}', product_id)
									.replace('{shop_id}', shop_id)

	console.log('Product ID:', product_id)
	console.log('Product API:', product_api)

	if (!product_id) {
		return cb_error('Cannot parse product id')
	}

	const options = {
		"credentials":"include",
		"headers": {
			"Accept":"text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
			"Accept-Language":"en-US,en;q=0.9,vi;q=0.8,ja;q=0.7,de;q=0.6",
			"Cache-Control":"max-age=0",
			"upgrade-insecure-requests":"1",
			"Referer": "https://www.google.com/",
			"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36"
		}
	}

	const cb_wrapper = (json) => {
		console.log('Product JSON:', json)
		if (config.format_func) return cb(config.format_func(json))
		return cb(json)
	}

	fetch(product_api, options)
		.then(res => res.json())
		.then(json => cb_wrapper(json))
		.catch(err => cb_error(err))
}

module.exports = (u, cb, cb_err) => {
	const provider = getProvider(u)

	// Validate supported url
	if (supported_domain.indexOf(provider) === -1) return {};

	return parseUrlWithConfig(u, parse_config[provider], 
		data => cb(data),
		err => cb_err(err)
	
	)
}

// module.exports('https://tiki.vn/hop-film-fujifilm-mini-20-tam-p381162.html', (x)=>x)