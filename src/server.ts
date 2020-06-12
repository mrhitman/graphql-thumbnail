import { ApolloServer } from "apollo-server-koa";
import dotenv from "dotenv";
import Koa from "koa";
import bodyparser from "koa-bodyparser";
import helmet from "koa-helmet";
import logger from "koa-morgan";
import "reflect-metadata";
import { buildSchemaSync } from "type-graphql";
import { ThumbnailResolver } from "./thumbnail";
import errorHandler from "./error-handler";

export function createApp() {
  const app = new Koa();
  const schema = buildSchemaSync({
    validate: true,
    resolvers: [ThumbnailResolver],
  });
  const server = new ApolloServer({ schema, playground: true });
  server.applyMiddleware({ app });
  app.use(helmet());
  app.use(bodyparser());
  app.use(logger("dev"));
  app.use(errorHandler);
  app.use((ctx) => {
    ctx.body = new Date();
  });
  return { app, server };
}

if (!module.parent) {
  dotenv.config();

  const { app, server } = createApp();
  const port = process.env.PORT || 5000;
  const httpServer = app.listen(port, () => {
    global.console.log(`Server UP on http://localhost:${port}/graphql`);
  });
  server.installSubscriptionHandlers(httpServer);
}
