import { Container, Service } from '@jojo/typedi'
import mongoose from 'mongoose'
import autoIncrement from 'mongoose-auto-increment'
import { ConfigService } from '../../../core/services/ConfigService'

mongoose.Promise = global.Promise

@Service()
export class MongodbService {
  public mongoose: typeof mongoose
  constructor() {
    const configService = Container.get(ConfigService)
    this.mongoose = mongoose
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)
    const mongodbConfig = configService.config.mongodb
    mongoose.connect(mongodbConfig.url, { useNewUrlParser: true }).then(() => {
      autoIncrement.initialize(mongoose.connection)
    }).catch((err) => console.error(err))
  }
}