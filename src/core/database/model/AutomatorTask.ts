import { prop, Typegoose } from 'typegoose'
import { IHorribleSubsItem } from '../../../automator/services/HorribleSubsService'
import { ITraceMoeItem } from '../../../automator/services/TraceMoeService'
import { IAnimeloopCliOutput } from '../../../automator/jobs/AnimeloopCliJob'

export enum AutomatorTaskStatus {
  Created = 'created',
  Downloading = 'downloading',
  Downloaded = 'downloaded',
  Animelooping = 'animelooping',
  Animelooped = 'animelooped',
  FetchingInfo = 'fetchingInfo',
  Fetched = 'fetched',
  Converting = 'converting',
  Success = 'success',
  Error = 'error'
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

  @prop({ default: [] })
  rawFiles?: string[]

  @prop({ default: [] })
  animeloopOutputs?: IAnimeloopCliOutput[]

  @prop()
  horribleSubsItem?: IHorribleSubsItem

  @prop()
  traceMoeItem?: ITraceMoeItem
}

export const AutomatorTaskModel = new AutomatorTask().getModelForClass(AutomatorTask)
