const {
    httpsFunctions,
    db,
    parseRules,
    collection
} = require('../utils')
const packages = require('../package.json')

module.exports = httpsFunctions.onRequest(async (req, res) => {
    db.collection(collection.METADATA)
        .doc('statistics')
        .get()
        .then(snapshot => {
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