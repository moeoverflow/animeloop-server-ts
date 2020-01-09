import { prop, Typegoose } from 'jojo-mongodb'

export class Group extends Typegoose {

  @prop({
    required: true
  })
  id: string

  @prop({
    required: true
  })
  name: string

  @prop({
    required: true
  })
  description: string

  @prop({
    required: false
  })
  cover: string
}

export const GroupModel = new Group().getModelForClass(Group)
