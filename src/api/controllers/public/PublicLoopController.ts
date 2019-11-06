import { Sequelize } from '@jojo/sequelize'
import { Get, JsonController, QueryParam } from 'routing-controllers'
import { Collection } from '../../../core/database/postgresql/models/Collection'
import { CollectionLoop } from '../../../core/database/postgresql/models/CollectionLoop'
import { Episode } from '../../../core/database/postgresql/models/Episode'
import { Loop } from '../../../core/database/postgresql/models/Loop'
import { Series } from '../../../core/database/postgresql/models/Series'
import { injectLoopsFileUrl } from '../../../utils/injectLoopsFileUrl'

@JsonController('/loops')
export class PublicLoopController {

  @Get('/best/rand')
  async getLoops(
    @QueryParam('n') n: number
  ) {
    const collection = await Collection.findOne({
      where: {
        slug: 'telegram-channel-the-best-animeloop',
      }
    })
    if (!collection) throw new Error('collection_not_found')
    const collectionLoops = await CollectionLoop.findAll({
      where: {
        collectionId: collection.id,
      },
      order: Sequelize.literal('random()'),
      limit: n ? Math.min(n, 100) : 100,
      attributes: ['loopId'],
      include: [Loop],
    })
    const loopIds = collectionLoops.map((i) => i.loopId)
    const loops = await Loop.findAll({
      where: {
        id: loopIds,
      },
      include: [Series, Episode],
    })
    return injectLoopsFileUrl(loops)
  }
}