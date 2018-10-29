import { prop, Typegoose, Ref } from 'typegoose'
import { index } from 'typegoose/lib/index'
import { Series } from './Series'

@index({ series: 1 })
export class Episode extends Typegoose {

  @prop({
    required: true
  })
  no: string


  @prop({
    ref: Series,
    required: true
  })
  series: Ref<Series>
}

export const EpisodeModel = new Episode().getModelForClass(Episode)
