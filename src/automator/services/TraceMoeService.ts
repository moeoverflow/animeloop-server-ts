import log4js from 'log4js'
import { Service } from 'typedi'
import { getBase64 } from '../utils/getBase64'
import bluebird from 'bluebird'
import request from 'request'
import { ConfigService } from '../../core/services/ConfigService'

export interface ITraceMoeDoc {
  from: number
  to: number
  anilist_id: number
  at: number
  season: string
  anime: string
  filename: string
  episode: string
  tokenthumb: string
  similarity: number
  title: string
  title_native: string
  title_chinese: string
  title_english: string
  title_romaji: string
  mal_id: number
  synonyms: []
  synonyms_chinese: any[]
  is_adult: false
}
export interface ITraceMoeItem {
  rawFile: string
  RawDocsCount: number
  RawDocsSearchTime: number
  ReRankSearchTime: number
  CacheHit: false
  trial: number
  docs: ITraceMoeDoc[]
}

/**
 * Fetch video source from HorribleSubs
 */
@Service()
export class TraceMoeService {
  constructor (
    private configService: ConfigService
  ) {}

  async searchImage(file: Buffer): Promise<ITraceMoeItem> {
    const { url, token } = this.configService.config.traceMoe
    const base64image = await getBase64(file)
    const result: any = await bluebird.fromCallback(callback => {
      request.post({
        url: `${url}?token=${token}`,
        form: {
          image: base64image,
        },
      }, callback)
    })

    return JSON.parse(result.body)
  }
}
