import { Sequelize } from 'sequelize-typescript'
import { Service } from 'typedi'
import { ConfigService } from '../../../core/services/ConfigService'

@Service()
export class MysqlService {
  public sequelize: Sequelize

  constructor(configService: ConfigService) {
    const mysqlConfig = configService.config.mysql
    this.sequelize = new Sequelize({
      database: mysqlConfig.database,
      dialect: mysqlConfig.dialect,
      username: mysqlConfig.username,
      password: mysqlConfig.password,
      models: [],
    })
  }
}