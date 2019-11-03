require("../init")
import { MysqlService } from '@jojo/mysql'
import { Container, Inject } from 'typedi'

export class MysqlSyncer {
  @Inject() mysqlService: MysqlService

  async run() {
    this.mysqlService.sequelize.addModels(['../core/database/mysql/models/*.[tj]s'])
    await this.mysqlService.sequelize.sync({ force: false })
  }
}

if (require.main === module) {
  Container.get(MysqlSyncer).run().catch((err) => { console.error(err) })
}