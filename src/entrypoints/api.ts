require("../init")
import { Container } from '@jojo/typedi'
import APIServer from '../api/APIServer'

const apiServer = Container.get(APIServer)
apiServer.run().catch((err) => {
  console.error(err)
})
