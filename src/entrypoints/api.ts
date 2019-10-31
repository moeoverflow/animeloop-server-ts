require("../init")
import { Container } from 'typedi'
import APIServer from '../api/APIServer'

const apiServer = Container.get(APIServer)
apiServer.run()
