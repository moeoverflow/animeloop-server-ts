import { Service } from '@jojo/typedi'
import { DateTime } from 'luxon'
import request = require('request-promise-native')
import { SeriesType } from '../../../core/database/postgresql/models/Series'

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
    extraLarge?: string
    large?: string
  }
  bannerImage?: string
}

/**
 * Fetch video source from HorribleSubs
 */
@Service()
export class AnilistService {
  constructor(
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
          extraLarge
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

    return result
  }

  getSeriesType(type?: string) {
    if (!type) return null
    switch (type) {
      case 'TV':
        return SeriesType.TV
      case 'MOVIE':
        return SeriesType.Movie
      case 'TV_SHORT':
        return SeriesType.TV
      case 'SPECIAL':
        return SeriesType.Special
      case 'ONA':
        return SeriesType.ONA
      case 'OVA':
        return SeriesType.OVA
      default:
        return SeriesType.Other
    }
  }

  getNewSeriesInfo(anilistItem: IAnilistItem) {
    const startDate = anilistItem.startDate && anilistItem.startDate.year && anilistItem.startDate.month && anilistItem.startDate.day
      ? DateTime.local(anilistItem.startDate.year, anilistItem.startDate.month, anilistItem.startDate.day)
      : null
    const endDate = anilistItem.endDate && anilistItem.endDate.year && anilistItem.endDate.month && anilistItem.endDate.day
      ? DateTime.local(anilistItem.endDate.year, anilistItem.endDate.month, anilistItem.endDate.day)
      : null

    const type = this.getSeriesType(anilistItem.format)

    return {
      titleJA: anilistItem.title.native || anilistItem.title.english,
      titleROMAJI: anilistItem.title.romaji,
      titleEN: anilistItem.title.english,
      startDate,
      endDate,
      type,
      genres: anilistItem.genres,
      isAdult: anilistItem.isAdult,
      cover: anilistItem.coverImage.extraLarge || anilistItem.coverImage.extraLarge || null,
      banner: anilistItem.bannerImage || null,
      anilistItem: anilistItem,
      anilistUpdatedAt: new Date(),
    }
  }
}
