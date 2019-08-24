import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import Bluebird from 'bluebird'
import Twit from 'twit'

@Service()
export class TwitterService {
  private twit: Twit

  constructor (
    private configService: ConfigService
  ) {
    const config = this.configService.config.bot.twitter
    this.twit = new Twit(config)
  }

  async tweetWithMedia(statusMessage: string, filepath: string) {
    const media: any = await Bluebird.fromCallback((callback) => {
      this.twit.postMediaChunked({ file_path: filepath }, callback)
    })

    await Bluebird.fromCallback((callback) => {
      this.twit.post('statuses/update', {
        status: statusMessage,
        media_ids: [media.media_id_string],
      }, callback)
    })
  }
}
