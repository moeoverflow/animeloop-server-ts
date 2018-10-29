import { prop, Typegoose } from 'typegoose'

export class Series extends Typegoose {
  @prop()
  title: string

  @prop()
  title_t_chinese: string

  @prop()
  title_romaji: string

  @prop()
  title_english: string

  @prop()
  title_japanese: string

  @prop()
  start_date_fuzzy: number

  @prop()
  description: string

  @prop()
  genres: string[]

  @prop()
  total_episodes: number

  @prop()
  adult: boolean

  @prop()
  end_date_fuzzy: number

  @prop()
  hashtag: string

  @prop()
  image_url_large: string

  @prop()
  image_url_banner: string

  @prop()
  anilist_updated_at: string

  @prop()
  updated_at: string

  @prop()
  type: string

  @prop({ unique: true })
  anilist_id: { type: Number, unique: true }
}

export const SeriesModel = new Series().getModelForClass(Series)
