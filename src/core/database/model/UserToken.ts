import { prop, Typegoose, plugin } from 'typegoose'
import { index } from 'typegoose/lib/index'
import autoIncrement from 'mongoose-auto-increment'

@index({ series: 1 })
@plugin(autoIncrement.plugin, { model: 'UserToken', filed: 'tid' })
export class UserToken extends Typegoose {

  @prop({
    required: true,
    unique: true
  })
  tid: number

  @prop({ required: true })
  name: string

  @prop({ required: true })
  token: string

  @prop({ required: true })
  userid: number
}

export const EpisodeModel = new UserToken().getModelForClass(UserToken)
