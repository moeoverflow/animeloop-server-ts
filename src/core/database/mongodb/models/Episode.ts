import { prop, Typegoose, Ref, plugin, InstanceType } from 'typegoose'
import { index } from 'typegoose/lib/index'
import findOrCreate from 'mongoose-findorcreate'
import { Series } from './Series'

@index({ series: 1 })
@plugin(findOrCreate)
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

  public static findOrCreate: (condition: Partial<InstanceType<Episode>>) => Promise<{ doc: InstanceType<Episode>, created: boolean }>
}

export const EpisodeModel = new Episode().getModelForClass(Episode)