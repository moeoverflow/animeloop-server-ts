import log4js from 'log4js'
import path from 'path'
import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import Queue from 'bull'
import { AnimeloopCliJob, AnimeloopCliJobData } from '../jobs/AnimeloopCliJob'

const logger = log4js.getLogger('Automator:Service:BullService')

export enum Jobs {
  AnimeloopCli = 'animeloop-cli'
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

    this.queue.process(Jobs.AnimeloopCli, 1, AnimeloopCliJob)
    this.empty()
  }

  async empty() {
    return await this.queue.empty()
  }

  async addAnimeloopCliJob(data: AnimeloopCliJobData) {
    const { filename } = data
    logger.info(`add animeloop-cli job: ${path.basename(filename)}`)
    return await this.queue.add(Jobs.AnimeloopCli, data, {
      jobId: `--ANIMELOOP-CLI--${path.basename(filename)}`.replace(/[^\w\s]/gi, '-'),
      delay: 1 * 1000
    })
  }
}
