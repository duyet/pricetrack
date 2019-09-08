const {
    loadRules,
    getSupportedDomain,
    getProvider,
    parseUrlWithConfig
} = require('./utils')

const ruleDir = __dirname + '/../../config'
const supportedDomain = getSupportedDomain(ruleDir)
const parseRules = loadRules(ruleDir)

console.log('Supported:', supportedDomain)

const pullProductDataFromUrl = async (u) => {
    const provider = getProvider(u)

    // Validate supported url
    if (supportedDomain.indexOf(provider) === -1) return null

    try {
        let rule = parseRules[provider]
        if (!rule.active) {
            console.info(`${provider} is disabled!`)
            return null;
        }
        return await parseUrlWithConfig(u, parseRules[provider])
    } catch (err) {
        console.error(err)
        return null
    }
}

module.exports = pullProductDataFromUrl