import mongoose from 'mongoose'
import autoIncrement from 'mongoose-auto-increment'

const Schema = mongoose.Schema

export const UserTokenSchema = new Schema({
  tid: { type: Number, require: true, unique: true },
  name: { type: String, require: true },
  token: { type: String, require: true },
  userid: { type: Number, require: true },
})
UserTokenSchema.plugin(autoIncrement.plugin, { model: 'UserToken', filed: 'tid' })

export const UserToken = mongoose.model('UserToken', UserTokenSchema)
