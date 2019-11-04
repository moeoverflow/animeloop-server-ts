require('module-alias/register')
import { MongodbService } from '@jojo/mongodb'
import { MysqlService } from '@jojo/sequelize'
import path from 'path'
import 'reflect-metadata'
import { Container } from 'typedi'

Container.get(MongodbService)
const mysqlService = Container.get(MysqlService)
mysqlService.sequelize.addModels([path.join(__dirname, './core/database/postgresql/models/*.[tj]s')])
