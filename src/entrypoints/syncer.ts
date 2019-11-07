require("../init")
import { SequelizeService } from '@jojo/sequelize'
import { Container, Inject } from '@jojo/typedi'

export class SequelizeSyncer {
  @Inject() sequelizeService: SequelizeService

  async run() {
    this.sequelizeService.sequelize.addModels(['../core/database/postgresql/models/*.[tj]s'])
    await this.sequelizeService.sequelize.sync({ force: false })
  }
}

if (require.main === module) {
  Container.get(SequelizeSyncer).run().catch((err) => { console.error(err) })
}