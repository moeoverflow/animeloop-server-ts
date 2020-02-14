import { Get, Inject, JsonController, QueryParam } from 'jojo-base'
import { Op } from 'jojo-sequelize'
import { Episode } from '../../../core/database/postgresql/models/Episode'
import { Loop } from '../../../core/database/postgresql/models/Loop'
import { Series } from '../../../core/database/postgresql/models/Series'
import { LoopService } from '../../../core/services/LoopService'
import { injectLoopsFileUrl } from '../../../utils/injectLoopsFileUrl'

@JsonController('/loops')
export class PublicLoopController {

  @Inject(() => LoopService) loopService: LoopService

  @Get('/best/rand')
  async getLoops(
    @QueryParam('limit') limit: number
  ) {

    const loopIds = await this.loopService.findRandomIds({ limit: limit || 12, collectionId: 1 })
    const loops = await Loop.findAll({
      where: {
        id: { [Op.in]: loopIds },
      },
      include: [Series, Episode],
    })
    return injectLoopsFileUrl(loops)
  }
}