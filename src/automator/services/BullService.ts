import Queue from 'bull'
import { Service } from 'jojo-typedi'
import log4js from 'log4js'
import { ConfigService } from '../../core/services/ConfigService'
import { AnimeloopCliJob, AnimeloopCliJobData } from '../jobs/AnimeloopCliJob'
import { ConvertJob, ConvertJobData } from '../jobs/ConvertJob'
import { FetchInfoJob, FetchInfoJobData } from '../jobs/FetchInfoJob'

const logger = log4js.getLogger('Automator:Service:BullService')

export enum Jobs {
  AnimeloopCli = 'animeloop-cli',
  FetchInfo = 'fetch-info',
  Convert = 'convert'
}

/**
 * Fetch video source from HorribleSubs
 */
@Service()
export class BullService {
  private animeloopCliQueue: Queue.Queue
  private fetchInfoQueue: Queue.Queue
  private convertQueue: Queue.Queue

  constructor(
    private configService: ConfigService
  ) {
    const { host, port, db } = this.configService.config.redis
    this.animeloopCliQueue = new Queue(`Animeloop-${Jobs.AnimeloopCli}`, { redis: { host, port, db }})
    this.fetchInfoQueue = new Queue(`Animeloop-${Jobs.FetchInfo}`, { redis: { host, port, db }})
    this.convertQueue = new Queue(`Animeloop-${Jobs.Convert}`, { redis: { host, port, db }})

    Promise.all([
      this.empty(),
      this.animeloopCliQueue.process(Jobs.AnimeloopCli, 1, AnimeloopCliJob),
      this.fetchInfoQueue.process(Jobs.FetchInfo, 1, FetchInfoJob),
      this.convertQueue.process(Jobs.Convert, 1, ConvertJob),
    ]).then().catch((err) => console.error(err))
  }

  async empty() {
    await this.animeloopCliQueue.empty()
    await this.fetchInfoQueue.empty()
    await this.convertQueue.empty()
  }

  async addAnimeloopCliJob(data: AnimeloopCliJobData) {
    const { taskId } = data
    logger.info(`add animeloop-cli job: ${taskId}`)
    return await this.animeloopCliQueue.add(Jobs.AnimeloopCli, data, {
      delay: 1 * 1000
    })
  }

  async addFetchInfoJob(data: FetchInfoJobData) {
    const { taskId } = data
    logger.info(`fetch info job: ${taskId}`)
    return await this.fetchInfoQueue.add(Jobs.FetchInfo, data)
  }

  async addConvertJob(data: ConvertJobData) {
    const { taskId } = data
    logger.info(`convert job: ${taskId}`)
    return await this.convertQueue.add(Jobs.Convert, data)
  }

}
