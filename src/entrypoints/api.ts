import { Container } from 'typedi'
import APIServer from '../api/APIServer'
import '../init'

const apiServer = Container.get(APIServer)
apiServer.run()
