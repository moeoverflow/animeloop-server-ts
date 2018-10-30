import { Service } from 'typedi'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import Nani from 'nani'
import { ConfigService } from '../../core/services/ConfigService'

export interface IAnilistItem {
  id: number
  title_romaji: string
  title_english: string
  title_japanese: string
  type: string
  series_type: string
  start_date: string
  end_date: number
  start_date_fuzzy: number
  end_date_fuzzy: number
  season: number
  description: string
  adult: false
  average_score: number
  mean_score: number
  popularity: number
  favourite: false
  image_url_sml: string
  image_url_med: string
  image_url_lge: string
  image_url_banner: string
  genres: string[]
  synonyms: []
  youtube_id: string
  hashtag: string
  updated_at: number
  score_distribution: {
    '10': number
    '20': number
    '30': number
    '40': number
    '50': number
    '60': number
    '70': number
    '80': number
    '90': number
    '100': number
  }
  list_stats: {
    completed: number
    on_hold: number
    dropped: number
    plan_to_watch: number
    watching: number
  }
  total_episodes: number
  duration: number
  airing_status: string
  source: string
  classification: ''
  airing_stats: {
    '1': { score: number, watching: number }
    '2': { score: number, watching: number }
    '3': { score: number, watching: number }
    '4': { score: number, watching: number }
    '1.5': { score: number, watching: number }
    '2.5': { score: number, watching: number }
    '3.5': { score: number, watching: number }
  }
  airing: {
    time: string
    countdown: number
    next_episode: number
  }
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


  async getInfo(id: number): Promise<IAnilistItem> {
    const dataDir = this.configService.config.storage.dir.data
    const dir = path.join(dataDir, 'anilist', `${id}`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }

    const result = await this.nani.get(`anime/${id}`)

    return result
  }
}
