const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');

const app = new Koa();
const router = new Router();

app
    .use(cors())
    .use(router.routes())
    .use(router.allowedMethods());

router.get('/ping', (ctx, next) => {
    ctx.body = 'ping';
});

router.get('/:function', async (ctx, next) => {
    const functionName = ctx.params.function;
    if (['pullData', 'updateInfo'].indexOf(functionName) === -1) {
        ctx.body = {err: 1};
        return;
    }

    const func = require('../functions/modules/' + functionName).onRequest;

    // Patch
    ctx.req.query = ctx.query;
    let koaResStatus = ctx.res.status;
    ctx.res.status = (code) => {
        koaResStatus = code;
        return ctx.res;
    }
    ctx.res.json = (json) => {
        ctx.body = json;
    }

    await func(ctx.req, ctx.res)
});

app.listen(process.env.PORT || 5000);