require("../init")
import express, { Router } from 'express'
import { Container, Inject, Service, useContainer, useExpressServer } from 'jojo-base'
import { graphqlHTTP } from 'jojo-graphql'
import path from 'path'
import { GraphqlService } from '../core/graphql/services/GraphqlService'
import { ConfigService } from '../core/services/ConfigService'
import cors from './middlewares/cors'

useContainer(Container);

@Service()
export default class APIServer {

  @Inject() graphqlService: GraphqlService
  @Inject() configService: ConfigService

  constructor(
  ) {
  }

  async run() {
    const config = this.configService.getConfig("api")
    const app = express()
    const router = Router()
    useExpressServer(router, {
      controllers: [
        path.join(__dirname, '/controllers/**/*Controller.[tj]s'),
      ]
    })
    app.use(cors)
    app.use('/rest', router)

    const schema = await this.graphqlService.getSchema()
    app.use("/graphql", (req, res, next) => {
      if (req.method === 'OPTIONS') {
        res.sendStatus(200);
      } else {
        next();
      }
    })
    app.use(
      '/graphql',
      graphqlHTTP({
        schema,
        graphiql: process.env.NODE_ENV !== 'production',
      }),
    );

    app.listen(config.port, config.host)
  }
}
