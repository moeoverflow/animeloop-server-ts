import { Service } from 'jojo-base'
import { TelegramService } from 'jojo-telegram'
import { Collection } from '../core/database/postgresql/models/Collection'
import { CollectionLoop } from '../core/database/postgresql/models/CollectionLoop'
import { Loop } from '../core/database/postgresql/models/Loop'
import { BotService } from './services/BotService'

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

      if (!postContent || !postContent.startsWith('https://animeloop.org/loop')) return
      const splited = postContent.split('/')
      const loopId = splited[splited.length - 1].slice(0, 36)
      const loop = await Loop.findOne({ where: { uuid: loopId } })
      if (!loop) return
      const collection = await Collection.findOne({
        where: {
          slug: 'telegram-channel-the-best-animeloop',
        }
      })
      if (!collection) throw new Error('collection_not_found')
      const doc = {
        loopId: loop.id,
        collectionId: collection.id,
      }
      await CollectionLoop.findOrCreate({
        where: doc,
        defaults: doc,
      })
    })
    this.telegramService.tg.launch().then().catch()
  }
}
