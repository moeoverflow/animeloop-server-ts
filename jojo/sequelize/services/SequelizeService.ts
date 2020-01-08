import { Service } from 'jojo-typedi'
import { Sequelize } from 'sequelize-typescript'
import { ConfigService } from '../../../src/core/services/ConfigService'

@Service()
export class SequelizeService {
  public sequelize: Sequelize

  constructor(configService: ConfigService) {
    const sequelizeConfig = configService.config.sequelize
    this.sequelize = new Sequelize({
      database: sequelizeConfig.database,
      dialect: sequelizeConfig.dialect,
      username: sequelizeConfig.username,
      password: sequelizeConfig.password,
      port: sequelizeConfig.port,
      host: sequelizeConfig.host,
      models: [],
    })
  }
}