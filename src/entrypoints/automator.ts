import * as Sentry from '@sentry/node'
import { Container } from 'typedi'
import AutomatorRunner from '../automator/AutomatorRunner'
import { ConfigService } from '../core/services/ConfigService'
import '../init'


const configService: ConfigService = Container.get(ConfigService)
Sentry.init({ dsn: configService.config.sentry.automator })

const automatorRunner = Container.get(AutomatorRunner)
automatorRunner.run().then(() => {}).catch((err) => console.error(err))
