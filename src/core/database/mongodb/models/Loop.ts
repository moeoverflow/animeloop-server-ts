import { prop, Typegoose, Ref } from 'typegoose'
import { index } from 'typegoose/lib/index'
import { Series } from './Series'
import { Episode } from './Episode'

@index({ series: 1, episode: 1 })
export class Loop extends Typegoose {

  @prop()
  duration: number

  @prop()
  period: {
    begin: String,
    end: String
  }

  @prop()
  frame: {
    begin: Number,
    end: Number
  }

  @prop()
  sourceFrom: string

  @prop()
  uploadDate: Date

  @prop({
    ref: Series,
    required: true
  })
  series: Ref<Series>

  @prop({
    ref: Episode,
    required: true
  })
  episode: Ref<Episode>
}

export const LoopModel = new Loop().getModelForClass(Loop)
