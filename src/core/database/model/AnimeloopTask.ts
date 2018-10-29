import { prop, Typegoose, Ref } from 'typegoose'
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
  Error = 'error',
  Done = 'done'
}

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
}

export const AnimeloopTaskModel = new AnimeloopTask().getModelForClass(AnimeloopTask)
