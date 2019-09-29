import '../init'
import { createExpressServer } from 'routing-controllers'
import { Service } from 'typedi'
import { PublicLoopController } from './controllers/PublicLoopController'


@Service()
export default class APIServer {
  constructor(
  ) {
  }

  run() {
    const app = createExpressServer({
      controllers: [
        PublicLoopController,
      ]
    })
    app.listen(8970)
  }
}
