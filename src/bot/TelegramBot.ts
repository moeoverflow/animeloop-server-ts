import { Service } from 'typedi'
import { GroupModel } from '../core/database/mongodb/models/Group'
import { GroupLoopModel } from '../core/database/mongodb/models/GroupLoop'
import { LoopModel } from '../core/database/mongodb/models/Loop'
import { BotService } from './services/BotService'
import { TelegramService } from './services/TelegramService'

@Service()
export default class TelegramBot {
  constructor(
    private telegramService: TelegramService,
    private botService: BotService,
  ) {
  }

  run() {
    // Telegram Bot commands
    this.telegramService.tg.command('randloop', async (ctx) => {
      const { loopUrl } = await this.botService.getRandomLoopData()
      await ctx.reply(loopUrl, {
        reply_to_message_id: ctx.message.message_id,
      })
    })
    this.telegramService.tg.command('randfavloop', async (ctx) => {
      const { loopUrl } = await this.botService.getRandomFavLoopData()
      await ctx.reply(loopUrl, {
        reply_to_message_id: ctx.message.message_id,
      })
    })

    // Telegram Channel updates
    this.telegramService.tg.on('channel_post', async (ctx) => {
      const channelUsername = ctx.update.channel_post.chat.username
      if (channelUsername !== 'the_best_animeloop') return

      const postContent = ctx.update.channel_post.text

      if (!postContent.startsWith('https://animeloop.org/loop')) return
      const splited = postContent.split('/')
      const loopId = splited[splited.length - 1].slice(0, 24)
      const loop = await LoopModel.findOne({ _id: loopId })
      if (loop) {
        const group = await GroupModel.findOne({
          id: 'telegram-channel-the-best-animeloop'
        })
        if (!group) throw new Error('group_not_found')
        await GroupLoopModel.findOrCreate({
          loop: loopId as any,
          group: group._id,
        })
      }
    })
    this.telegramService.tg.launch().then().catch()
  }
}
