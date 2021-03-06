import bluebird from 'bluebird'
import { Service } from 'jojo-base'
import log4js from 'log4js'
import Transmission from 'transmission'
import { ConfigService } from './ConfigService'

const logger = log4js.getLogger('Automator:Service:TransmissionService')

export enum TransmissionStatus {
  Stopped = 0,
  CheckWait = 1,
  Check = 2,
  DownloadWait = 3,
  Download = 4,
  SeedWait = 5,
  Seed = 6,
  Isolated = 7
}

@Service()
export class TransmissionService {
  private transmission: any

  constructor(
    private configService: ConfigService
  ) {
    const config = this.configService.getConfig("transmission")
    this.transmission = new Transmission(config)
  }

  async findSeedingTasks(): Promise<any[]> {
    const tasks = (await bluebird.fromCallback((callback: any) => {
      this.transmission.get(callback)
    })) as any
    return tasks.torrents.filter((task: any) => task.status === TransmissionStatus.Seed)
  }

  async addUrl(url: string) {
    logger.info('fetch HorribleSubs data')
    const { downloadDir } = this.configService.getConfig("transmission")
    return (await bluebird.fromCallback((callback: any) => {
      this.transmission.addUrl(url, {
        'download-dir': downloadDir
      }, callback)
    })) as { hashString: string, id: number, name: string }
  }

  async remove(ids: number[], deleteFile: boolean = false) {
    return await bluebird.fromCallback((callback: any) => {
      this.transmission.remove(ids, deleteFile, callback)
    })
  }

}