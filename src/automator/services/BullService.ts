import log4js from 'log4js'
import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import Queue from 'bull'
import { AnimeloopCliJob, AnimeloopCliJobData } from '../jobs/AnimeloopCliJob'
import { FetchInfoJob, FetchInfoJobData } from '../jobs/FetchInfoJob'
import { ConvertJob, ConvertJobData } from '../jobs/ConvertJob'

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
  private queue: Queue.Queue

  constructor (
    private configService: ConfigService
  ) {
    const { host, port, db } = this.configService.config.redis
    this.queue = new Queue('animeloop', { redis: { host, port, db }})

    this.empty()
    this.queue.process(Jobs.AnimeloopCli, 1, AnimeloopCliJob)
    this.queue.process(Jobs.FetchInfo, FetchInfoJob)
    this.queue.process(Jobs.Convert, ConvertJob)
  }

  async empty() {
    return await this.queue.empty()
  }

  async addAnimeloopCliJob(data: AnimeloopCliJobData) {
    const { taskId } = data
    logger.info(`add animeloop-cli job: ${taskId}`)
    return await this.queue.add(Jobs.AnimeloopCli, data, {
      delay: 1 * 1000
    })
  }

  async addFetchInfoJob(data: FetchInfoJobData) {
    const { taskId } = data
    logger.info(`fetch info job: ${taskId}`)
    return await this.queue.add(Jobs.FetchInfo, data)
  }

  async addConvertJob(data: ConvertJobData) {
    const { taskId } = data
    logger.info(`convert job: ${taskId}`)
    return await this.queue.add(Jobs.Convert, data)
  }

}
