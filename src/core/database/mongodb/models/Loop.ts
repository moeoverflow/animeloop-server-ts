import { index, prop, Ref, Typegoose } from '@jojo/mongodb'
import { Episode } from './Episode'
import { Series } from './Series'

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

  @prop()
  newId: string

  @prop()
  files: any
}

export const LoopModel = new Loop().getModelForClass(Loop)
