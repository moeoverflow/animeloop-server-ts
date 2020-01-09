import { Container, Service } from 'jojo-base'
import mongoose from 'mongoose'
import autoIncrement from 'mongoose-auto-increment'
import { ConfigService } from './ConfigService'

mongoose.Promise = global.Promise

@Service()
export class MongodbService {
  public mongoose: typeof mongoose
  constructor() {
    const configService = Container.get(ConfigService)
    this.mongoose = mongoose
    mongoose.set('useCreateIndex', true)
    mongoose.set('useFindAndModify', false)
    const config = configService.getConfig("mongodb")
    mongoose.connect(config.url, { useNewUrlParser: true }).then(() => {
      autoIncrement.initialize(mongoose.connection)
    }).catch((err) => console.error(err))
  }
}