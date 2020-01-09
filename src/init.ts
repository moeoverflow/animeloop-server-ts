// tslint:disable: ordered-imports
require('module-alias/register');

import path from 'path'
import 'reflect-metadata'

// set global container variables
import { Container } from 'jojo-base'
Container.set('project_config_filepath', path.join(__dirname, './config.js'))

// initial MongoDB
// import { MongodbService } from 'jojo-mongodb'
// Container.get(MongodbService)

// initial PostgreSQL
import { SequelizeService } from 'jojo-sequelize'
const sequelizeService = Container.get(SequelizeService)
sequelizeService.sequelize.addModels([path.join(__dirname, './core/database/postgresql/models/*.[tj]s')])
