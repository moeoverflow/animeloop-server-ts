import { findOrCreate, index, InstanceType, plugin, prop, Ref, Typegoose } from 'jojo-mongodb'
import { Group } from './Group'
import { Loop } from './Loop'

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
