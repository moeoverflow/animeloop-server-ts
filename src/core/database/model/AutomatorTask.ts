import { prop, Typegoose } from 'typegoose'
import { IHorribleSubsItem } from '../../../automator/services/HorribleSubsService'
import { ITraceMoeItem } from '../../../automator/services/TraceMoeService'

export enum AutomatorTaskStatus {
  Created = 'created',
  Downloading = 'downloading',
  Downloaded = 'downloaded',
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

  @prop()
  files?: string[]

  @prop()
  horribleSubsItem?: IHorribleSubsItem

  @prop()
  traceMoeItem?: ITraceMoeItem
}

export const AutomatorTaskModel = new AutomatorTask().getModelForClass(AutomatorTask)
