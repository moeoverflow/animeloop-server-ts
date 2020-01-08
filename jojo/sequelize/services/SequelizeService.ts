import { Service } from 'jojo-base'
import { Sequelize } from 'sequelize-typescript'
import { ConfigService } from './ConfigService'

@Service()
export class SequelizeService {
  public sequelize: Sequelize

  constructor(configService: ConfigService) {
    const config = configService.getConfig("sequelize")
    this.sequelize = new Sequelize({
      database: config.database,
      dialect: config.dialect,
      username: config.username,
      password: config.password,
      port: config.port,
      host: config.host,
      models: [],
    })
  }
}