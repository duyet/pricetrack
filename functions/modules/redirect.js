const Koa = require('koa')
const koaFirebase = require('koa-firebase-functions')
const Router = require('koa-router')
const {
    httpsFunctions,
    db,
    documentIdFromHashOrUrl,
    collection,
    getDeepLink,
} = require('../utils')

const app = new Koa()
const router = new Router()

router.get('/:id?', async (ctx) => {
    let urlId = ctx.params.id || ctx.query.id
    let email = ctx.params.email || ''
    let ref = ctx.params.ref || ''
    try {
        let snapshot = await db.collection(collection.URLS)
                             .doc(documentIdFromHashOrUrl(urlId))
                             .get()
        const deepLink = getDeepLink(snapshot.get('url'), {
            utm_campaign: 'tracker',
            utm_content: email
        })


        const deeplinkClickFromEmail = snapshot.get('deeplinkClickFromEmail') || 0
        const deeplinkClick = snapshot.get('deeplinkClick') || 0
        snapshot.ref.set({
            deeplinkClick: deeplinkClick + 1,
            deeplinkClickFromEmail: ref === 'email' ? deeplinkClickFromEmail + 1 : deeplinkClickFromEmail
        }, { merge: true })
        return ctx.redirect(deepLink)
    } catch (err) {
        ctx.status = 404
        ctx.body = {err: 1}
    }
})

app.use(router.routes()).use(router.allowedMethods())

module.exports = httpsFunctions.onRequest(koaFirebase(app))