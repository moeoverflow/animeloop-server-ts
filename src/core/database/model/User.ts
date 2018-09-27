import mongoose from 'mongoose'
import autoIncrement from 'mongoose-auto-increment'

const Schema = mongoose.Schema

export const UserSchema = new Schema({
  uid: { type: Number, require: true, unique: true },
  username: { type: String, require: true },
  email: { type: String, require: true },
  avatar: { type: String, require: false },
  password: { type: String, require: true },
  admin: { type: Boolean, default: false },
  verified: { type: Boolean, default: false },
})
UserSchema.plugin(autoIncrement.plugin, { model: 'User', field: 'uid' })

export const User = mongoose.model('User', UserSchema)
