import '../init'
import path from 'path'
import { createKoaServer } from 'routing-controllers'
import { Service } from 'typedi'

@Service()
export default class APIServer {
  constructor(
  ) {
  }

  run() {
    const app = createKoaServer({
      controllers: [
        path.join(__dirname, '/controllers/**/*Controller.[tj]s'),
      ]
    })
    app.listen(8970)
  }
}
