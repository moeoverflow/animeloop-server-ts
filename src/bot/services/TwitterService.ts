import { InstanceType } from 'typegoose'
import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import path from 'path'
import Bluebird from 'bluebird'
import Twit from 'twit'
import { GroupLoopModel } from '../../core/database/model/GroupLoop'
import { GroupModel } from '../../core/database/model/Group'
import { LoopModel } from '../../core/database/model/Loop'
import { ObjectId } from 'bson'
import { Series } from '../../core/database/model/Series'
import { Episode } from '../../core/database/model/Episode'

@Service()
export class TwitterService {
  private twit: Twit

  constructor (
    private configService: ConfigService
  ) {
    const config = this.configService.config.bot.twitter
    this.twit = new Twit(config)
  }

  async tweetMedia() {
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

    const media: any = await Bluebird.fromCallback((callback) => {
      const filepath = path.join(this.configService.config.storage.dir.data, 'mp4_1080p', `${loop._id}.mp4`)
      this.twit.postMediaChunked({ file_path: filepath }, callback)
    })

    await Bluebird.fromCallback((callback) => {
      const series = loop.series as InstanceType<Series>
      const episode = loop.episode as InstanceType<Episode>
      const statusMessage = `${series.title_japanese} ${episode.no}\n` +
      `${series.title} ${episode.no}\n` +
      `${series.title_english} ${episode.no}\n` +
      `${loop.period.begin.slice(0, 11)}~${loop.period.end.slice(0, 11)}\n` +
      '#Animeloop\n' +
      `https://animeloop.org/loop/${loop.id}`

      this.twit.post('statuses/update', {
        status: statusMessage,
        media_ids: [media.media_id_string],
      }, callback)
    })
  }
}
