const { loadRules, getSupportedDomain, getProvider, parseUrlWithConfig, validateUrlPath } = require('./utils')

const ruleDir = __dirname + '/../../config'
const supportedDomain = getSupportedDomain(ruleDir)
const parseRules = loadRules(ruleDir)

console.log('Supported:', supportedDomain)

module.exports = async (u, cb, cb_err) => {
    const provider = getProvider(u)

    // Validate supported url
    if (supportedDomain.indexOf(provider) === -1) return {}

    const data = await parseUrlWithConfig(u, parseRules[provider])

    if (data) cb(data)

    // TODO
    else cb_err('Cannot parse data')
}