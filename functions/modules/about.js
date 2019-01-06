const express = require('express')
const functions = require('firebase-functions')

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


module.exports = functions.https.onRequest(app)