import { prop, Typegoose, plugin } from 'typegoose'
import { index } from 'typegoose/lib/index'
import autoIncrement from 'mongoose-auto-increment'

@index({ uid: 1 })
@plugin(autoIncrement.plugin, { model: 'User', field: 'uid' })
export class User extends Typegoose {
  @prop({
    required: true,
    unique: true
  })
  uid: number

  @prop({
    unique: true,
    required: true
  })
  username: string

  @prop({
    unique: true,
    required: true
  })
  email: string

  @prop()
  avatar: string

  @prop({ required: true })
  password: string

  @prop({
    required: true,
    default: false
  })
  admin: boolean

  @prop({
    required: true,
    default: false
  })
  verified: boolean
}

export const UserModel = new User().getModelForClass(User)
