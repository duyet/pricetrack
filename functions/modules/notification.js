const admin = require('firebase-admin')

const {
    httpsFunctions
} = require('../utils')

module.exports = httpsFunctions.onRequest((req, res) => {
    var registrationToken = req.query.token
    var message = {
          "token" : registrationToken,
          "notification": {
            "title": "FCM Message",
            "body": "This is a message from FCM"
          },
          "webpush": {
            "headers": {
              "Urgency": "high"
            },
            "fcm_options": {
                "link": "https://dummypage.com"
            },
            "notification": {
              "body": "This is a message from FCM to web",
              "requireInteraction": "true",
              "badge": "/badge-icon.png"
            }
          }
      }

      admin.messaging().send(message)
        .then((response) => {
            // Response is a message ID string.
            res.send(`Successfully sent message: ${response}`);
        })
        .catch((error) => {
            res.send(`Error sending message: ${error}`);
        })
})