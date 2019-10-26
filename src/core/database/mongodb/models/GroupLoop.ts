import { prop, Typegoose, Ref, plugin, InstanceType } from 'typegoose'
import { index } from 'typegoose/lib/index'
import { Loop } from './Loop'
import findOrCreate from 'mongoose-findorcreate'
import { Group } from './Group'

@index({ group: 1 })
@plugin(findOrCreate)
export class GroupLoop extends Typegoose {

  @prop({
    ref: Loop,
    required: true
  })
  loop: Ref<Loop>

  @prop({
    ref: Group,
    required: true
  })
  group: Ref<Group>

  public static findOrCreate: (condition: Partial<InstanceType<GroupLoop>>) => Promise<{ doc: InstanceType<GroupLoop>, created: boolean }>
}

export const GroupLoopModel = new GroupLoop().getModelForClass(GroupLoop)
