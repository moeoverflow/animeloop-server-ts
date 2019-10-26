import '../init'
import { createKoaServer } from 'routing-controllers'
import { Service } from 'typedi'
import { PublicLoopController } from './controllers/PublicLoopController'


@Service()
export default class APIServer {
  constructor(
  ) {
  }

  run() {
    const app = createKoaServer({
      controllers: [
        PublicLoopController,
      ]
    })
    app.listen(8970)
  }
}
