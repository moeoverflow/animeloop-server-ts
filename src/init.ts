// tslint:disable: ordered-imports

import 'reflect-metadata'

import path from 'path'

import { MongodbService } from 'jojo-mongodb'
import { SequelizeService } from 'jojo-sequelize'
import { Container } from 'jojo-base'

// set project config filepath
Container.set('project_config_service', path.join(__dirname, '../config.js'))

// initial MongoDB
Container.get(MongodbService)
const sequelizeService = Container.get(SequelizeService)
sequelizeService.sequelize.addModels([path.join(__dirname, './core/database/postgresql/models/*.[tj]s')])
