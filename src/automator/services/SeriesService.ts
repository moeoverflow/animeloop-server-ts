import { Service } from 'typedi'
import { IAnilistItem } from './AnilistService'
import { padStart } from 'lodash'
import { SeriesModel } from '../../core/database/mongodb/models/Series'

@Service()
export class SeriesService {
  constructor (
  ) {
  }

  public async updateInfoFromAnilistItem(seriesId: string, anilistItem: IAnilistItem) {
    const start_date_fuzzy = anilistItem.startDate &&
    anilistItem.startDate.year && anilistItem.startDate.month && anilistItem.startDate.day
    ? `${anilistItem.startDate.year}${padStart(anilistItem.startDate.month.toString(), 2, '0')}${padStart(anilistItem.startDate.day.toString(), 2, '0')}` : undefined
    const end_date_fuzzy = anilistItem.endDate
    && anilistItem.endDate.year && anilistItem.endDate.month && anilistItem.endDate.day
    ? `${anilistItem.endDate.year}${padStart(anilistItem.endDate.month.toString(), 2, '0')}${padStart(anilistItem.endDate.day.toString(), 2, '0')}` : undefined
    await SeriesModel.updateOne({ _id: seriesId }, {
      title_romaji: anilistItem.title.romaji,
      title_english: anilistItem.title.english || anilistItem.title.romaji,
      title_japanese: anilistItem.title.native,
      description: anilistItem.description,
      start_date_fuzzy,
      end_date_fuzzy,
      type: anilistItem.format,
      genres: anilistItem.genres,
      adult: anilistItem.isAdult,
      image_url_large: anilistItem.coverImage.large,
      image_url_banner: anilistItem.bannerImage
    })
  }
}
