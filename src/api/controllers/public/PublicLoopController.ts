import { Controller, Get, QueryParam } from 'routing-controllers'
import { GroupModel } from '../../../core/database/mongodb/models/Group'
import { GroupLoopModel } from '../../../core/database/mongodb/models/GroupLoop'
import { LoopModel } from '../../../core/database/mongodb/models/Loop'
import { ObjectId } from 'mongodb'

@Controller('/loops')
export class PublicLoopController {

  @Get('/best/rand')
  async getLoops(
    @QueryParam('n') n: number
  ) {
    const group = await GroupModel.findOne({
      id: 'telegram-channel-the-best-animeloop'
    })
    if (!group) throw new Error('group_not_found')
    const GroupLoops = await GroupLoopModel.aggregate([
      { $match: { group: group._id } },
      { $sample: { size: Math.min(n || 10, 999) } },
    ])
    const loopIds = GroupLoops.map((i) => i.loop as ObjectId)

    const loops = await LoopModel.find({ _id: loopIds })
    return {
      loops: loops.map((i) => {
        return {
          ...i.toJSON(),
          _id: i._id.toString(),
          series: (i.series as any).toString(),
          episode: (i.episode as any).toString(),
        }
      })
    }
  }
}