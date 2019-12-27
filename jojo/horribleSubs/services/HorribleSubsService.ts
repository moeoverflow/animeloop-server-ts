import { Service } from '@jojo/typedi'
import log4js from 'log4js'
import { DateTime } from 'luxon'
import Parser from 'rss-parser'
import { ConfigService } from '../../../core/services/ConfigService'

const logger = log4js.getLogger('Automator:Service:HorribleSubsService')
logger.level = 'debug'

export interface IHorribleSubsItem {
  title: string
  link: string
  pubDate: Date
  guid: string
  isoDate: Date
}

/**
 * Fetch video source from HorribleSubs
 */
@Service()
export class HorribleSubsService {
  constructor(
    private configService: ConfigService
  ) {}

  async fetchRss(limit: number = Number.MAX_VALUE) {
    logger.info('fetch HorribleSubs data')
    const { blacklist, rss, delayDays } = this.configService.config.horribleSubs
    const parser = new Parser()
    try {
      const feed = await parser.parseURL(rss) as { items: IHorribleSubsItem[] }
      if (!feed) {
        logger.error(new Error('HorribleSubs_rss_feed_return_nothing'))
        return []
      }
      return (feed.items as IHorribleSubsItem[])
      .filter((item) =>
        blacklist.findIndex((re: RegExp) => re.test(item.title)) === -1
      )
      .filter((item) => DateTime.fromJSDate(new Date(item.pubDate)).plus({ days: delayDays }).diffNow().milliseconds < 0)
      .slice(0, limit)
    } catch (error) {
      logger.error(new Error('HorribleSubs_rss_feed_fetch_error'))
      return []
    }
  }
}
