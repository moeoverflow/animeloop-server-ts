require("../init")
import { MysqlService } from '@jojo/mysql'
import { Container, Inject } from 'typedi'

export class MysqlSyncer {
  @Inject() mysqlService: MysqlService

  async run() {
    this.mysqlService.sequelize.addModels(['../core/database/mysql/models/*.[tj]s'])
    console.log(this.mysqlService.sequelize.models)
    await this.mysqlService.sequelize.sync({ force: false })
  }
}

if (require.main === module) {
  Container.get(MysqlSyncer).run().catch((err) => { console.error(err) })
}