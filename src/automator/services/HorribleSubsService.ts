import Parser from 'rss-parser'
import log4js from 'log4js'
import { compareAsc, addDays } from 'date-fns'
import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import { AutomatorTaskService } from './AutomatorTaskService'

const logger = log4js.getLogger('Automator:Service:HorribleSubsService')

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
  constructor (
    protected automatorTaskService: AutomatorTaskService,
    private configService: ConfigService
  ) {}

  async fetchRss(limit: number = Number.MAX_VALUE) {
    logger.info('fetch HorribleSubs data')
    const { blacklist, rss, delayDays } = this.configService.config.horribleSubs
    const parser = new Parser()
    const feed = await parser.parseURL(rss) as { items: IHorribleSubsItem[] }
    if (!feed) {
      throw new Error('HorribleSubs_rss_feed_return_nothing')
    }
    return (feed.items as IHorribleSubsItem[])
    .filter(item => {
      return blacklist.findIndex((re: RegExp) => re.test(item.title)) === -1
    })
    .filter(item => compareAsc(new Date(), addDays(item.pubDate, delayDays)) > 0)
    .slice(0, limit)
  }
}
