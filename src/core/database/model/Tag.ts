import { prop, Typegoose, Ref } from 'typegoose'
import { Loop } from './Loop'

export class Tag extends Typegoose {

  @prop()
  type: string

  @prop()
  value: string

  @prop()
  confidence: string

  @prop()
  source: string

  @prop()
  lang: string

  @prop({
    ref: Loop,
    required: true
  })
  loopid: Ref<Loop>
}

export const EpisodeModel = new Tag().getModelForClass(Tag)
