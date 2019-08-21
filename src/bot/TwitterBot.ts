import log4js from 'log4js'
import schedule from 'node-schedule'

import { Service } from 'typedi'
import { TwitterService } from './services/TwitterService'

const logger = log4js.getLogger('Bot:twitterbot')
logger.level = 'debug'

@Service()
export default class TwitterBot {
  constructor(
    private twitterService: TwitterService,
  ) {
  }

  run() {
    schedule.scheduleJob('0 0/4 * * * *', async () => {
      this.twitterService.tweetMedia()
    })
  }
}
