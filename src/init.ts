// tslint:disable-next-line: ordered-imports
import 'reflect-metadata'

import { MongodbService } from 'jojo-mongodb'
import { SequelizeService } from 'jojo-sequelize'
import { Container } from 'jojo-typedi'
import path from 'path'

Container.get(MongodbService)
const sequelizeService = Container.get(SequelizeService)
sequelizeService.sequelize.addModels([path.join(__dirname, './core/database/postgresql/models/*.[tj]s')])
