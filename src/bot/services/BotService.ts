import { Sequelize } from '@jojo/sequelize'
import { Inject, Service } from '@jojo/typedi'
import { Collection } from '../../core/database/postgresql/models/Collection'
import { CollectionLoop } from '../../core/database/postgresql/models/CollectionLoop'
import { Episode } from '../../core/database/postgresql/models/Episode'
import { Loop } from '../../core/database/postgresql/models/Loop'
import { Series } from '../../core/database/postgresql/models/Series'
import { ConfigService } from '../../core/services/ConfigService'
import { MinioS3Service } from '../../core/services/MinioS3Service'

@Service()
export class BotService {

  @Inject(() => ConfigService) configService: ConfigService
  @Inject(() => MinioS3Service) minioS3Service: MinioS3Service

  constructor(
  ) {
  }

  async getRandomLoopData() {
    const loop = await Loop.findOne({
      limit: 1,
      order: Sequelize.literal('random()'),
      include: [Series, Episode],
    })
    if (!loop) throw new Error('random_loop_not_found')
    return this.getLoopData(loop)
  }

  async getRandomFavLoopData() {
    const group = await Collection.findOne({
      where: {
        slug: 'telegram-channel-the-best-animeloop',
      },
    })
    if (!group) throw new Error('group_not_found')
    const collectionLoop = await CollectionLoop.findOne({
      order: Sequelize.literal('random()'),
      include: [{
        model: Loop,
        include: [Series, Episode],
      }],
    })
    if (!collectionLoop || !collectionLoop.loop) throw new Error('random_loop_not_found')
    return this.getLoopData(collectionLoop.loop)
  }

  private getLoopData(loop: Loop) {
    const series = loop.series
    const episode = loop.episode

    const loopUrl = `https://animeloop.org/loop/${loop.uuid}`
    const statusMessage = `${series.titleJA} ${episode.index}\n\
    ${series.titleCHS || series.titleCHT} ${episode.index}\n\
    ${series.titleEN} ${episode.index}\n\
    ${loop.periodBegin.slice(0, 11)}~${loop.periodEnd.slice(0, 11)}\n\
    #Animeloop\n`
    const filepath = this.minioS3Service.getLocalFilePath(loop.files['mp4_720p'])

    return {
      loopUrl,
      statusMessage,
      filepath,
    }
  }

}
