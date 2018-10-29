import log4js from 'log4js'
import path from 'path'
import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import Queue from 'bull'
import { AnimeloopCliJob, AnimeloopCliJobData } from '../jobs/AnimeloopCliJob'
import { FetchInfoJob, FetchInfoJobData } from '../jobs/FetchInfoJob'

const logger = log4js.getLogger('Automator:Service:BullService')

export enum Jobs {
  AnimeloopCli = 'animeloop-cli',
  FetchInfo = 'fetch-info'
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
  }

  async empty() {
    return await this.queue.empty()
  }

  async addAnimeloopCliJob(data: AnimeloopCliJobData) {
    const { taskId } = data
    logger.info(`add animeloop-cli job: ${taskId}`)
    return await this.queue.add(Jobs.AnimeloopCli, data, {
      jobId: `--ANIMELOOP-CLI--${taskId}`,
      delay: 1 * 1000
    })
  }

  async addFetchInfoJob(data: FetchInfoJobData) {
    const { taskId } = data
    logger.info(`fetch info job: ${taskId}`)
    return await this.queue.add(Jobs.FetchInfo, data, {
      jobId: `--FETCH-INFO--${taskId}`
    })
  }


}
