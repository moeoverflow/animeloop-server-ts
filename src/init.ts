require('module-alias/register')
import { MongodbService } from '@jojo/mongodb'
import { SequelizeService } from '@jojo/sequelize'
import path from 'path'
import 'reflect-metadata'
import { Container } from 'typedi'

Container.get(MongodbService)
const sequelizeService = Container.get(SequelizeService)
sequelizeService.sequelize.addModels([path.join(__dirname, './core/database/postgresql/models/*.[tj]s')])
