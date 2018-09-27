import mongoose from 'mongoose'
import findOrCreate from 'mongoose-findorcreate'

const Schema = mongoose.Schema

export const SeriesSchema = new Schema({
  title: String,
  title_t_chinese: String,
  title_romaji: String,
  title_english: String,
  title_japanese: String,
  start_date_fuzzy: Number,
  description: String,
  genres: [String],
  total_episodes: Number,
  adult: Boolean,
  end_date_fuzzy: Number,
  hashtag: String,
  image_url_large: String,
  image_url_banner: String,
  anilist_updated_at: Date,
  updated_at: Date,
  type: String,
  anilist_id: { type: Number, unique: true },
})
SeriesSchema.plugin(findOrCreate)

export const Series = mongoose.model('Series', SeriesSchema)
