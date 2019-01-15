const { loadRules, getSupportedDomain, getProvider, parseUrlWithConfig, validateUrlPath } = require('./utils')

const ruleDir = __dirname + '/../../config'
const supportedDomain = getSupportedDomain(ruleDir)
const parseRules = loadRules(ruleDir)

console.log('Supported:', supportedDomain)

module.exports = (u, cb, cb_err) => {
    const provider = getProvider(u)

    // Validate supported url
    if (supportedDomain.indexOf(provider) === -1) return {}

    return parseUrlWithConfig(
        u,
        parseRules[provider],
        data => cb(data),
        err => cb_err(err)
    )
}