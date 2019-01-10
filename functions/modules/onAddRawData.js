const functions = require('firebase-functions')
const { collection } = require('../utils')

module.exports = functions.firestore
    .document(`${collection.URLS}/{docId}/raw/{rawId}`)
    .onWrite((change, context) => {
        console.log('triggerrr')
        console.log(change, 'change')
        console.log(context, 'context')

        return true
    })