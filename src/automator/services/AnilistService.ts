import { Service } from 'typedi'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import Nani from 'nani'
import { ConfigService } from '../../core/services/ConfigService'

export interface IAnilistItem {

}

/**
 * Fetch video source from HorribleSubs
 */
@Service()
export class AnilistService {
  private nani: any

  constructor (
    private configService: ConfigService
  ) {
    const { id, secret } = configService.config.anilist
    this.nani = Nani.init(id, secret)
  }


  async getInfo(id: number) {
    const dataDir = this.configService.config.storage.dir.data
    const dir = path.join(dataDir, 'anilist', `${id}`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }

    const result = await this.nani.get(`anime/${id}`)

    return result
  }
}
