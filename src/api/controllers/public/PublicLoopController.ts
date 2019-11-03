import { Sequelize } from '@jojo/mysql'
import { Controller, Get, QueryParam } from 'routing-controllers'
import { Collection } from '../../../core/database/mysql/models/Collection'
import { CollectionLoop } from '../../../core/database/mysql/models/CollectionLoop'
import { Episode } from '../../../core/database/mysql/models/Episode'
import { Loop } from '../../../core/database/mysql/models/Loop'
import { Series } from '../../../core/database/mysql/models/Series'
import { injectLoopsFileUrl } from '../../../utils/injectLoopsFileUrl'

@Controller('/loops')
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
      order: Sequelize.literal('rand()'),
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