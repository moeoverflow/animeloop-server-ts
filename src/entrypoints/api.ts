import '../init'
import app from '../api/app'
import { Container } from 'typedi'
import { ConfigService } from '../core/service/ConfigService'

const configService = Container.get(ConfigService)
/**
 * Start Express server.
 */

 const { port, host } = configService.config.api
const server = app.listen(port, host, () => {
  console.log(
    `  App is running at http://${host}:${port} in %s mode`,
    app.get('env')
  )
  console.log('  Press CTRL-C to stop\n')
})

export default server
