import mongoose from 'mongoose'
import findOrCreate from 'mongoose-findorcreate'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

export const EpisodeSchema = new Schema({
  title: String,
  series: { type: ObjectId, ref: 'Series', require: true },
  no: String,
})
EpisodeSchema.plugin(findOrCreate)

export const Episode = mongoose.model('Episode', EpisodeSchema)
