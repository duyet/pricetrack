const {
    lightHttpsFunctions,
    db,
    parseRules,
    collection
} = require('../utils')
const packages = require('../package.json')

module.exports = lightHttpsFunctions.onRequest(async (req, res) => {
    db.collection(collection.METADATA)
        .doc('statistics')
        .get()
        .then(snapshot => {
            // Global, non-personalized data — let the Hosting CDN cache it
            res.set('Cache-Control', 'public, max-age=300, s-maxage=3600')
            res.json({
                info: {
                    app: 'pricetrack',
                    version: require('../package.json').version || ''
                },
                status: parseRules,
                credits: Object.keys(packages.dependencies),
                statistics: snapshot.data()
            })
        })
})