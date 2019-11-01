import { IAnilistItem } from '@jojo/anilist'
import findOrCreate from 'mongoose-findorcreate'
import { InstanceType, plugin, prop, Ref, Typegoose } from 'typegoose'
import { IAnimeloopCliOutput } from '../../../../automator/jobs/AnimeloopCliJob'
import { ITraceMoeItem } from '../../../../automator/services/TraceMoeService'
import { AutomatorTask } from './AutomatorTask'

export enum AnimeloopTaskStatus {
  Created = 'created',
  Animelooping = 'animelooping',
  Animelooped = 'animelooped',
  InfoFetching = 'infofetching',
  InfoWait = 'infowait',
  InfoCompleted = 'infocompleted',
  Converting = 'converting',
  Converted = 'converted',
  Adding = 'adding',
  Done = 'done',
  Error = 'error'
}

@plugin(findOrCreate)
export class AnimeloopTask extends Typegoose {
  @prop({
    required: true,
    default: AnimeloopTaskStatus.Created
  })
  status: AnimeloopTaskStatus

  @prop({ default: [] })
  rawFile: string

  @prop()
  output?: IAnimeloopCliOutput

  @prop()
  traceMoeItem?: ITraceMoeItem

  @prop()
  anilistId: number

  @prop()
  seriesTitle?: string

  @prop()
  episodeNo?: string

  @prop()
  anilistItem?: IAnilistItem

  @prop({
    required: true,
    ref: AutomatorTask
  })
  automatorTask: Ref<AutomatorTask>

  @prop()
  errorMessage: any

  public static findOrCreate: (condition: Partial<InstanceType<AnimeloopTask>>) => Promise<{ doc: InstanceType<AnimeloopTask>, created: boolean }>
}

export const AnimeloopTaskModel = new AnimeloopTask().getModelForClass(AnimeloopTask)
