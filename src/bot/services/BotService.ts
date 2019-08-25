import path from 'path'
import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'

import { InstanceType } from 'typegoose'
import { GroupLoopModel } from '../../core/database/model/GroupLoop'
import { GroupModel } from '../../core/database/model/Group'
import { LoopModel, Loop } from '../../core/database/model/Loop'
import { ObjectId } from 'bson'
import { Series } from '../../core/database/model/Series'
import { Episode } from '../../core/database/model/Episode'


@Service()
export class BotService {

  constructor (
    private configService: ConfigService
  ) {
  }

  async getRandomLoopData() {
    const loops = await LoopModel.aggregate([
      { $sample: { size: 1 } },
    ])
    const loopId = loops.length > 0 ? loops[0]._id as ObjectId : undefined
    const loop = await LoopModel.findOne({ _id: loopId }).populate('series').populate('episode').exec()
    if (!loop) throw new Error('random_loop_not_found')

    return this.getLoopData(loop)
  }

  async getRandomFavLoopData() {
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

    return this.getLoopData(loop)
  }

  private getLoopData(loop: InstanceType<Loop>) {
    const series = loop.series as InstanceType<Series>
    const episode = loop.episode as InstanceType<Episode>

    const loopUrl = `https://animeloop.org/loop/${loop.id}`
    const statusMessage = `${series.title_japanese} ${episode.no}\n` +
    `${series.title} ${episode.no}\n` +
    `${series.title_english} ${episode.no}\n` +
    `${loop.period.begin.slice(0, 11)}~${loop.period.end.slice(0, 11)}\n` +
    '#Animeloop\n' +
    loopUrl
    const filepath = path.join(this.configService.config.storage.dir.data, 'mp4_720p', `${loop._id}.mp4`)

    return {
      loopUrl,
      statusMessage,
      filepath,
    }
  }

}
