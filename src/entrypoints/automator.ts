require("../init")
import { Container } from '@jojo/typedi'
import * as Sentry from '@sentry/node'
import AutomatorRunner from '../automator/AutomatorRunner'
import { ConfigService } from '../core/services/ConfigService'

const configService: ConfigService = Container.get(ConfigService)
Sentry.init({ dsn: configService.config.sentry.automator })

const automatorRunner = Container.get(AutomatorRunner)
automatorRunner.run().then(() => {}).catch((err) => console.error(err))
