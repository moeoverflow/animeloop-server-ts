import { Service } from 'typedi'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import { ConfigService } from '../../core/services/ConfigService'
import request = require('request-promise-native')
import { imageDownloader } from '../utils/imageDownloader'

export interface IAnilistItem {
  id: number
  title: {
    romaji?: string
    english?: string
    native?: string
  }
  description: string
  type: string
  startDate?: {
    year?: number
    month?: number
    day?: number
  }
  endDate?: {
    year?: number
    month?: number
    day?: number
  }
  season?: string
  episodes?: number
  format?: string
  genres?: string[]
  isAdult?: boolean
  siteUrl?: string
  coverImage?: {
    large?: string
  }
  bannerImage?: string
}

/**
 * Fetch video source from HorribleSubs
 */
@Service()
export class AnilistService {
  constructor (
    private configService: ConfigService
  ) {
  }


  async getInfo(id: number): Promise<IAnilistItem> {
    const query = `
    query ($id: Int) {
      Media (id: $id, type: ANIME) {
        id
        title {
          romaji
          english
          native
        }
        description
        type
        startDate {
          year
          month
          day
        }
        endDate {
          year
          month
          day
        }
        season
        episodes
        format
        genres
        isAdult
        siteUrl
        coverImage {
          large
        }
        bannerImage
      }
    }
    `
    const variables = {
        id
    }

    const response = await request.post({
      url: 'https://graphql.anilist.co',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      form: {
        query,
        variables
      }
    })

    const result = JSON.parse(response).data.Media as IAnilistItem

    if (!result) {
      throw new Error('anilistItem_not_found')
    }

    const dataDir = this.configService.config.storage.dir.data
    const dir = path.join(dataDir, 'anilist', `${id}`)
    if (!fs.existsSync(dir)) {
      mkdirp.sync(dir)
    }

    if (result.coverImage && result.coverImage.large) {
      try {
        const coverExtname = path.extname(result.coverImage.large)
        const filename = path.join(dir, `image_large${coverExtname}`)
        if (!fs.existsSync(filename)) {
          await imageDownloader(result.coverImage.large, path.join(dir, `image_large${coverExtname}`))
        }
        result.coverImage.large = `https://animeloop.org/files/anilist/${id}/image_large${coverExtname}`
      } catch (error) {
        result.coverImage.large = null
      }

    }

    if (result.bannerImage) {
      try {
        const bannerExtname = path.extname(result.bannerImage)
        const filename = path.join(dir, `image_banner${bannerExtname}`)
        if (!fs.existsSync(filename)) {
          await imageDownloader(result.bannerImage, filename)
        }
        result.bannerImage = `https://animeloop.org/files/anilist/${id}/image_large${bannerExtname}`
      } catch (error) {
        result.bannerImage = null
      }
    }

    return result
  }
}
