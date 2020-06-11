import { ApolloServer } from 'apollo-server-koa';
import dotenv from 'dotenv';
import Koa from 'koa';
import bodyparser from 'koa-bodyparser';
import helmet from 'koa-helmet';
import logger from 'koa-morgan';
import serve from 'koa-static';
import 'reflect-metadata';
import { buildSchemaSync } from 'type-graphql';
import { ThumbnailResolver } from './thumbnail';
import errorHandler from './error-handler';

export function createApp() {
  const schema = buildSchemaSync({
    validate: true,
    resolvers: [ThumbnailResolver],
  });

  const app = new Koa();
  const server = new ApolloServer({ schema, playground: true });
  app.use(helmet());
  app.use(bodyparser());
  app.use(logger('dev'));
  app.use(serve('storage'));
  server.applyMiddleware({ app });
  app.use(errorHandler);
  app.use((ctx) => {
    ctx.body = new Date();
  });
  return app;
}

if (!module.parent) {
  dotenv.config();

  const app = createApp();
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    global.console.log(`Server UP ${port}`);
  });
}
