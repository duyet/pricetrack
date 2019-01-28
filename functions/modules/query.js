const {
  httpsFunctions,
  db,
  collection,
  documentIdFromHashOrUrl,
  redashFormat
} = require('../utils')

module.exports = httpsFunctions.onRequest((req, res) => {
  const url = '' + req.query.url
  let fields = (req.query.fields ? '' + req.query.fields : 'price')
  const orderBy = req.query.order && req.query.order == 'desc' ? 'desc' : 'asc'
  const limit = req.query.limit ? parseInt(req.query.limit) : 100
  const redash = req.query.redash || req.query.redash_format

  fields = fields.split(',')
  var urlHash = documentIdFromHashOrUrl(url)

  console.log(fields, limit)

  db
    .collection(collection.URLS)
    .doc(urlHash)
    .collection('raw')
    .orderBy('datetime', orderBy)
    .limit(limit)
    .get()
    .then(snapshot => {
      if (snapshot.empty) return res.json([])
      else {
        let docs = []
        snapshot.forEach(doc => {
          let row = {}
          for (let field of fields) {
            let _item = {}

            if (field == 'datetime') _item[field] = doc.get(field).toDate()
            else _item[field] = doc.get(field)

            row = Object.assign(row, _item)
          }
          docs.push(row)
        })
        return redash ? res.json(redashFormat(docs)) : res.json(docs)
      }
    })
    .catch(err => {
      console.log('Error getting documents', err)
      return res.status(400).json([])
    })
})