const express = require('express')
const functions = require('firebase-functions')
const { supportedDomain, parseRules } = require('../utils')

const app = express()

// About
app.get('/', (req, res) => res.json({
    app: 'pricetrack',
    version: require('../package.json').version || ''
}))

// Credits
app.get('/credits', (req, res) => {
    const packages = require('../package.json')
    res.json(Object.keys(packages.dependencies))
})

app.get('/status', (req, res) => {
    res.json(parseRules)
})


module.exports = functions.https.onRequest(app)