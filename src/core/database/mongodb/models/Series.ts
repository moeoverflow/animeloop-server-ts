import { findOrCreate, InstanceType, plugin, prop, Typegoose } from '@jojo/mongodb'

@plugin(findOrCreate)
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
  anilist_updated_at: Date

  @prop()
  updated_at: Date

  @prop()
  type: string

  @prop({ unique: true })
  anilist_id: number

  public static findOrCreate: (condition: Partial<InstanceType<Series>>) => Promise<{ doc: InstanceType<Series>, created: boolean }>
}

export const SeriesModel = new Series().getModelForClass(Series)
