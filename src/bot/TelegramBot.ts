import { Service } from 'typedi'
import { TelegramService } from './services/TelegramService'
import { BotService } from './services/BotService'

@Service()
export default class TelegramBot {
  constructor(
    private telegramService: TelegramService,
    private botService: BotService,
  ) {
  }

  run() {
    this.telegramService.tg.command('randloop', async (ctx) => {
      const { loopUrl } = await this.botService.getRandomLoopData()
      ctx.reply(loopUrl, {
        reply_to_message_id: ctx.message.message_id,
      })
    })
    this.telegramService.tg.command('randfavloop', async (ctx) => {
      const { loopUrl } = await this.botService.getRandomFavLoopData()
      ctx.reply(loopUrl, {
        reply_to_message_id: ctx.message.message_id,
      })
    })
    this.telegramService.tg.launch()
  }
}
