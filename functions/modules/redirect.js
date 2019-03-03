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
    try {
        let snapshot = await db.collection(collection.URLS)
                             .doc(documentIdFromHashOrUrl(urlId))
                             .get()
        const deepLink = getDeepLink(snapshot.get('url'))
        
        const deeplinkClick = snapshot.get('deeplinkClick') || 0
        snapshot.ref.set({ deeplinkClick: deeplinkClick + 1 }, { merge: true })
        return ctx.redirect(deepLink)
    } catch (err) {
        ctx.status = 404
        ctx.body = {err: 1}
    }
})

app.use(router.routes()).use(router.allowedMethods())

module.exports = httpsFunctions.onRequest(koaFirebase(app))