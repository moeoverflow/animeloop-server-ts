import { prop, Typegoose, Ref, plugin, InstanceType } from 'typegoose'
import findOrCreate from 'mongoose-findorcreate'
import { ITraceMoeItem } from '../../../automator/services/TraceMoeService'
import { IAnimeloopCliOutput } from '../../../automator/jobs/AnimeloopCliJob'
import { AutomatorTask } from './AutomatorTask'

export enum AnimeloopTaskStatus {
  Created = 'created',
  Animelooping = 'animelooping',
  Animelooped = 'animelooped',
  InfoFetching = 'infofetching',
  InfoWait = 'waitinfo',
  InfoCompleted = 'infocompleted',
  Converting = 'converting',
  Converted = 'converted',
  Adding = 'adding',
  Done = 'done'
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

  @prop({
    required: true,
    ref: AutomatorTask
  })
  automatorTask: Ref<AutomatorTask>

  public static findOrCreate: (condition: Partial<InstanceType<AnimeloopTask>>) => Promise<{ doc: InstanceType<AnimeloopTask>, created: boolean }>
}

export const AnimeloopTaskModel = new AnimeloopTask().getModelForClass(AnimeloopTask)
