import '../init'
import AutomatorRunner from '../automator/AutomatorRunner'
import { Container } from 'typedi'
import { ConfigService } from '../core/services/ConfigService'
import * as Sentry from '@sentry/node'


const configService: ConfigService = Container.get(ConfigService)
Sentry.init({ dsn: configService.config.sentry.automator })

const automatorRunner = Container.get(AutomatorRunner)
automatorRunner.run()
