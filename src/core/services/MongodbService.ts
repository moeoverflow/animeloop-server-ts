import mongoose from 'mongoose'
import autoIncrement from 'mongoose-auto-increment'
import { Service } from 'typedi'
import { ConfigService } from './ConfigService'

mongoose.Promise = global.Promise

@Service()
export class MongodbService {
  public mongoose: typeof mongoose
  constructor(configService: ConfigService) {
    this.mongoose = mongoose
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)
    const mongodbConfig = configService.config.mongodb
    mongoose.connect(mongodbConfig.url, { useNewUrlParser: true })
    autoIncrement.initialize(mongoose.connection)
  }
}