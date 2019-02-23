const functions = require('firebase-functions')
const { httpsFunctions, db, formatPrice, hostingUrl, getDeepLink } = require('../../utils')
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


// module.exports = httpsFunctions.onRequest((req, res) => {
//     var registrationToken = req.query.token
//     var message = {
//           "token" : registrationToken,
//           "notification": {
//             "title": "FCM Message",
//             "body": "This is a message from FCM"
//           },
//           "webpush": {
//             "headers": {
//               "Urgency": "high"
//             },
//             "fcm_options": {
//                 "link": "https://dummypage.com"
//             },
//             "notification": {
//               "body": "This is a message from FCM to web",
//               "requireInteraction": "true",
//               "badge": "/badge-icon.png"
//             }
//           }
//       }

// })


// const SUBJECT = {
//     available: ({APP_NAME, PRODUCT_NAME}) => `[${APP_NAME}] Sản phẩm vừa có hàng: ${PRODUCT_NAME}`,
//     price_change: ({APP_NAME, PRODUCT_NAME}) => `[${APP_NAME}] Sản phẩm vừa thay đổi giá: ${PRODUCT_NAME}`,
//     down_below: ({APP_NAME, PRODUCT_NAME}) => `[${APP_NAME}] Sản phẩm vừa thay đổi giá mong đợi: ${PRODUCT_NAME}`,
// }


// const sendEmail = async (email, params) => {
//     const mailOptions = {
//         from: `${APP_NAME} <${FROM_EMAIL}>`,
//         to: email,
//     }


//     const htmlHeadLine = EMAIL_HTML_HEADLINE[templateType]
//     const htmlProductStatus = templateType === 'available' 
//                                     ? `<li>Trạng thái: <strong>${params.inventory_status ? 'Có hàng' : 'Hết hàng'}</strong></li>`
//                                     : ``

//     const htmlProductExpectPrice = templateType === 'down_below'
//                                     ? `<li>Giá mong đợi: ${formatPrice(params.expect_price)}</li>`
//                                     : ``

//     // The user subscribed to the newsletter.
//     mailOptions.subject = EMAIL_SUBJECT[templateType]({PRODUCT_NAME: params.info.name, APP_NAME})
//     mailOptions.html = `Xin chào ${email || ''}
//     <br /><br />
//     ${htmlHeadLine}: <br />

//     <ul>
//         <li>
//             Sản phẩm: <a href="${getDeepLink(params.url)}">${params.info.name}</a>
//             <a href="${getDeepLink(params.url)}">(${params.domain})</a>
//         </li>
//         <li>
//             Price Track: <a href="${hostingUrl}/view/${params.id}"><strong>Lịch sử giá</strong></a> | 
//             <a href="${getDeepLink(params.url)}"><strong>Tới trang sản phẩm (${params.domain})</strong></a>
//         </li>
//         <li>
//             Giá: ${formatPrice(params.latest_price, false, params.info.currency)} 
//             <strong style="color: ${params.price_change < 0 ? '#2e7d32' : '#c62828'}">
//                 (${formatPrice(params.price_change, true, params.info.currency)})
//             </strong>
//         </li>
//         ${htmlProductStatus}
//         ${htmlProductExpectPrice}
//     </ul>
//     <br />
//     <i>PricetrackBot</i>`;
    
//     try {
//         let email = await mailTransport.sendMail(mailOptions)
//         console.log('Email sent to:', email)
//     } catch (err) {
//         console.error(`Cannot send email ${email}`, err.message)
//     }
// }

