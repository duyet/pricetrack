const crypto = require('crypto')
const {
  normalizeUrl
} = require('./formater')

module.exports = {
  /**
   * Return hash from url, if it already hashed, skip it
   * 
   * @param s {string} url hash or url
   * @return {string}
   */
  documentIdFromHashOrUrl: s => {
    let str = String(s)
    return (/^[a-fA-F0-9]+$/).test(s) ?
      s :
      crypto.createHash('sha1').update(normalizeUrl(str)).digest('hex')
  },

  /**
   * Return hash from url
   * 
   * @param s {string} url hash or url
   * @return {string}
   */
  hashUrl: s => crypto.createHash('sha1').update(s).digest('hex'),

}