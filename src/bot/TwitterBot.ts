import schedule from 'node-schedule'

import { Service } from 'typedi'
import { TwitterService } from './services/TwitterService'
import { BotService } from './services/BotService'

@Service()
export default class TwitterBot {
  constructor(
    private twitterService: TwitterService,
    private botService: BotService,
  ) {
  }

  async tweetRandomLoop() {
    const { statusMessage, filepath } = await this.botService.getRandomFavLoopData()
    await this.twitterService.tweetWithMedia(statusMessage, filepath)
  }

  run() {
    schedule.scheduleJob('0 */4 * * *', async () => {
      let retry = 3

      while (retry > 0) {
        try {
          await this.tweetRandomLoop()
          break
        } catch (error) {
          retry -= 1
        }
      }
    })
  }
}
