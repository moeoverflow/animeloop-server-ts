import Bluebird from 'bluebird';
import { Service } from 'jojo-base';
import Twit from 'twit';
import { ConfigService } from './ConfigService';

@Service()
export class TwitterService {
  private twit: Twit

  constructor(
    configService: ConfigService
  ) {

    const config = configService.getConfig("twitter")
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
