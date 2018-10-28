import '../init'
import AutomatorRunner from '../automator/AutomatorRunner'
import { Container } from 'typedi'

const automatorRunner = Container.get(AutomatorRunner)
automatorRunner.run()
