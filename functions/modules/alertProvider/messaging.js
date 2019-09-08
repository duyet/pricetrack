const { db, formatPrice, hostingUrl } = require('../../utils')
const { collection: { MESSAGING_TOKEN } } = require('../../utils/constants')
const admin = require('firebase-admin')

const APP_NAME = `Pricetrack`

module.exports = async(email, params) => {
    let messagingInfo = null
    try {
        messagingInfo = await db.collection(MESSAGING_TOKEN).doc(email).get()
    } catch(err) {
        console.error(`User ${email} do not have messaging token info`)
        return false
    }

    const templateType = ['available', 'down_below'].indexOf(params.expect_when) > -1 ? params.expect_when : 'price_change'
    console.info(`======================= ${JSON.stringify(params)}, ${templateType}`)

    const MESSAGE_BODY = {
        available: `Sản phẩm bạn đang theo dõi vừa có hàng`,
        price_change: `Sản phẩm bạn đang theo dõi vừa thay đổi giá`,
        down_below: `Sản phẩm bạn đang theo dõi có giá nhỏ hơn số đang mong đợi`,
    }

    const BODY = templateType === 'available' 
                    ? `CÓ HÀNG - ${MESSAGE_BODY[templateType]}`
                    : `${formatPrice(params.latest_price, false, params.info.currency)} `
                      + `(${formatPrice(params.price_change, true, params.info.currency)}) `
                      + `${MESSAGE_BODY[templateType]}`

    var message = {
        token : messagingInfo.get('token'),
        notification: {
          title: `[${APP_NAME}] ${params.info.name}`,
          body: BODY
        },
        "webpush": {
          "headers": {
            "Urgency": "high"
          },
          "fcm_options": {
              "link": `${hostingUrl}/view/${params.id}`
          }
        }
    }

    admin.messaging().send(message)
    .then((response) => {
        // Response is a message ID string.
        console.log(`Successfully sent message: ${response}`);
    })
    .catch((error) => {
        console.error(`Error sending message: ${error}`);
    })
}
