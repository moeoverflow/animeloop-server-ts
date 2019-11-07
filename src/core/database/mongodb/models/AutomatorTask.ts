import { findOrCreate, InstanceType, plugin, prop, Typegoose } from '@jojo/mongodb'

export enum AutomatorTaskStatus {
  Created = 'created',
  Downloading = 'downloading',
  Downloaded = 'downloaded',
  Animelooping = 'animelooping',
  Animelooped = 'animelooped',
  InfoFetching = 'infofetching',
  InfoCompleted = 'infocompleted',
  Converting = 'converting',
  Converted = 'converted',
  Adding = 'adding',
  Done = 'done'
}

@plugin(findOrCreate)
export class AutomatorTask extends Typegoose {
  @prop({
    required: true,
    default: AutomatorTaskStatus.Created
  })
  status: AutomatorTaskStatus

  @prop({
    required: true,
    unique: true
  })
  name: string

  @prop({
    required: true,
    unique: true
  })
  magnetLink: string

  @prop()
  transmissionId: number

  @prop({ default: [] })
  rawFiles?: string[]

  public static findOrCreate: (condition: Partial<InstanceType<AutomatorTask>>) => Promise<{ doc: InstanceType<AutomatorTask>, created: boolean }>
}

export const AutomatorTaskModel = new AutomatorTask().getModelForClass(AutomatorTask)
