import { prop, Typegoose, Ref, plugin } from 'typegoose'
import { AnimeloopTask } from './AnimeloopTask'

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
  Done = 'done'
}

export class AutomatorTask extends Typegoose {
  @prop({ required: true })
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
}

export const AutomatorTaskModel = new AutomatorTask().getModelForClass(AutomatorTask)
