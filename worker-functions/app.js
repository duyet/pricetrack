const Koa = require('koa');
const Router = require('@koa/router');
const cors = require('@koa/cors');
const logger = require('koa-logger')
const { Logging } = require('@google-cloud/logging');


const app = new Koa();
const router = new Router();
const logging = new Logging();
const log = logging.log('pricetracker-worker');

app
    .use(cors())
    .use(logger({
        transporter: (str, args) => {
            console.log(str);
            const METADATA = {
                resource: {
                    type: 'cloud_function',
                    labels: {
                        function_name: 'pricetrackWorker',
                        region: 'us-central1'
                    }
                }
            };

            const event = str.substr(0, '--> GET'.length)
            const data = {
                event: event,
                value: str,
                message: str
            };
            const entry = log.entry(METADATA, data);
            log.write(entry);
        }
    }))
    .use(router.routes())
    .use(router.allowedMethods());

router.all('/ping', (ctx, next) => {
    ctx.body = 'pong';
});

router.all('/:function', async (ctx, next) => {
    const functionName = ctx.params.function;
    if (['pullData', 'updateInfo'].indexOf(functionName) === -1) {
        ctx.body = { err: 1 };
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