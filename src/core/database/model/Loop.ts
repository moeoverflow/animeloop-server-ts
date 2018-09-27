import mongoose from 'mongoose'

const Schema = mongoose.Schema
const ObjectId = Schema.Types.ObjectId

export const LoopSchema = new Schema({
  duration: Number,
  period: {
    begin: String,
    end: String,
  },
  frame: {
    begin: Number,
    end: Number,
  },
  episode: { type: ObjectId, ref: 'Episode', require: true },
  series: { type: ObjectId, ref: 'Series', require: true },
  r18: { type: Boolean, default: false },
  sourceFrom: String,
  uploadDate: { type: Date, require: true },
  likes: { type: Number, default: 0 },
})

export const Loop = mongoose.model('Loop', LoopSchema)
