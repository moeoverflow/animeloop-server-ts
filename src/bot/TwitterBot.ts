import log4js from 'log4js'
import schedule from 'node-schedule'
import path from 'path'

import { Service } from 'typedi'
import { ConfigService } from '../core/services/ConfigService'
import { TwitterService } from './services/TwitterService'
import { InstanceType } from 'typegoose'
import { GroupLoopModel } from '../core/database/model/GroupLoop'
import { GroupModel } from '../core/database/model/Group'
import { LoopModel } from '../core/database/model/Loop'
import { ObjectId } from 'bson'
import { Series } from '../core/database/model/Series'
import { Episode } from '../core/database/model/Episode'

const logger = log4js.getLogger('Bot:twitterbot')
logger.level = 'debug'

@Service()
export default class TwitterBot {
  constructor(
    private twitterService: TwitterService,
    private configService: ConfigService,
  ) {
  }

  async tweetRandomLoop() {
    const group = await GroupModel.findOne({
      id: 'telegram-channel-the-best-animeloop'
    })
    if (!group) throw new Error('group_not_found')
    const GroupLoops = await GroupLoopModel.aggregate([
      { $match: { group: group._id } },
      { $sample: { size: 1 } },
    ])
    const loopId = GroupLoops.length > 0 ? GroupLoops[0].loop as ObjectId : undefined
    const loop = await LoopModel.findOne({ _id: loopId }).populate('series').populate('episode').exec()
    if (!loop) throw new Error('random_loop_not_found')

    const series = loop.series as InstanceType<Series>
    const episode = loop.episode as InstanceType<Episode>

    const statusMessage = `${series.title_japanese} ${episode.no}\n` +
    `${series.title} ${episode.no}\n` +
    `${series.title_english} ${episode.no}\n` +
    `${loop.period.begin.slice(0, 11)}~${loop.period.end.slice(0, 11)}\n` +
    '#Animeloop\n' +
    `https://animeloop.org/loop/${loop.id}`
    const filepath = path.join(this.configService.config.storage.dir.data, 'mp4_720p', `${loop._id}.mp4`)

    await this.twitterService.tweetWithMedia(statusMessage, filepath)
  }

  run() {
    schedule.scheduleJob('0 */4 * * * *', async () => {
      let retry = 3

      while (retry > 0) {
        try {
          await this.tweetRandomLoop()
          break
        } catch (error) {
          retry -= 1
        }
      }
    })
  }
}
