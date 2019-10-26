import 'reflect-metadata'
import { Container } from 'typedi'
import { MysqlService } from './core/services/MysqlService'
import { MongodbService } from './core/services/MongodbService'

Container.get(MongodbService)
Container.get(MysqlService)
