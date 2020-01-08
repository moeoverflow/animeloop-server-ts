import { Service } from 'jojo-typedi'
import Telegraf, { ContextMessageUpdate } from 'telegraf'
import { ConfigService } from '../../../src/core/services/ConfigService'

@Service()
export class TelegramService  {
  public tg: Telegraf<ContextMessageUpdate>

  constructor(
    private configService: ConfigService
  ) {
    const config = this.configService.config.bot.telegram
    this.tg = new Telegraf(config.apiToken)
  }
}
