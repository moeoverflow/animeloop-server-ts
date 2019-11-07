require("../init")
import { Container } from '@jojo/typedi'
import AutomatorRunner from '../automator/AutomatorRunner'

const automatorRunner = Container.get(AutomatorRunner)
automatorRunner.run().then(() => {}).catch((err) => console.error(err))
