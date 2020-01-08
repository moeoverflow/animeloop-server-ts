import { Service } from 'jojo-base'
import Telegraf, { ContextMessageUpdate } from 'telegraf'
import { ConfigService } from './ConfigService'

@Service()
export class TelegramService  {
  public tg: Telegraf<ContextMessageUpdate>

  constructor(
    private configService: ConfigService
  ) {
    const config = this.configService.getConfig('telegram')
    this.tg = new Telegraf(config.apiToken)
  }
}
