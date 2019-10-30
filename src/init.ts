import 'reflect-metadata'
import { Container } from 'typedi'
import { MongodbService } from './core/services/MongodbService'
import { MysqlService } from './core/services/MysqlService'

Container.get(MongodbService)
Container.get(MysqlService)
