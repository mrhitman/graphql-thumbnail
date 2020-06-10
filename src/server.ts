import dotenv from 'dotenv';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import logger from 'koa-morgan';

export function createApp() {
    const app = new Koa();
    app.use(helmet());
    app.use(bodyparser());
    app.use(logger('dev'));
    app.use(ctx => {
        ctx.body = new Date();
    });
    return app;
}

if (!module.parent) {
    dotenv.config();
    const app = createApp();
    const port = process.env.PORT || 3000;
    app.listen(port, () => global.console.log(`Server UP ${port}`));
}