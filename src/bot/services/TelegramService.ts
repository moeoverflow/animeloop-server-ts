import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import Telegraf, { ContextMessageUpdate } from 'telegraf'

@Service()
export class TelegramService  {
  public tg: Telegraf<ContextMessageUpdate>

  constructor (
    private configService: ConfigService
  ) {
    const config = this.configService.config.bot.telegram
    this.tg = new Telegraf(config.apiToken)
  }
}
