module.exports = {
  collection: {
    URLS: 'urls',
    RAW_DATA: 'raw',
    SUBSCRIBE: 'subscribe',
    METADATA: 'metadata',
    CRONJOB_LOGS: 'cronjob_logs',
    MESSAGING_TOKEN: 'messaging_token',
    ADMIN: 'admin',
    CASHBACK: 'cashback'
  },
  eventType: {
    WRITE: 'google.firestore.document.write'
  },
  text: {
    URL_NOT_FOUND: 'URL không tồn tại',
    ERR_EMAIL_NOT_FOUND: 'Email không tồn tại',
    ERR_URL_NOT_SUPPORTED: 'Xin lỗi, hiện tại chưa hỗ trợ URL này',
    ERR_EMAIL_REQUIRED: 'Vui lòng đăng nhập',
    ERR_TOKEN_INVALID: 'Token không đúng',
    ERR_MISSING_URL: 'URL là bắt buộc',
    ERR_CANNOT_FETCH_DATA: 'Không thể fetch data',
    ERR_NOT_IS_ADMIN: 'User is not an admin user',
    ERR_ID_NOT_FOUND: 'ID không tồn tại'
  },

  URL_PARAMS_WHITELIST: [ 'spid' ],

  email: {
    APP_NAME: `Pricetrack`,
    FROM_EMAIL: `pricetrack.apps@gmail.com`
  }
}