import { IAnilistItem } from '@jojo/anilist';
import { BelongsTo, Column, enumWords, ForeignKey, Sequelize, StateMachineParanoidModel, Table } from '@jojo/sequelize';
import { ITraceMoeItem } from '@jojo/tracemoe';
import { IAnimeloopCliOutput } from '../../../../automator/jobs/AnimeloopCliJob';
import { AutomatorTask } from './AutomatorTask';

export enum AnimeloopTaskStatus {
  Created = 'created',
  Animelooping = 'animelooping',
  Animelooped = 'animelooped',
  InfoFetching = 'infoFetching',
  InfoWait = 'infoWait',
  InfoCompleted = 'infoCompleted',
  Converting = 'converting',
  Converted = 'converted',
  Adding = 'adding',
  Done = 'done',
}

@Table
export class AnimeloopTask extends StateMachineParanoidModel<AnimeloopTask, AnimeloopTaskStatus> {
  @Column({
    type: Sequelize.ENUM(...enumWords(AnimeloopTaskStatus)),
    allowNull: false,
    defaultValue: AnimeloopTaskStatus.Created,
  })
  readonly status: AnimeloopTaskStatus

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  file: string

  @Column({
    type: Sequelize.JSON,
    allowNull: true,
  })
  output: IAnimeloopCliOutput

  @Column({
    type: Sequelize.JSON,
    allowNull: true,
  })
  traceMoeItem: ITraceMoeItem

  @Column({
    type: Sequelize.INTEGER,
    allowNull: true,
  })
  anilistId: number

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  seriesTitle: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  episodeIndex: string

  @Column({
    type: Sequelize.JSON,
    allowNull: true,
  })
  anilistItem: IAnilistItem

  @ForeignKey(() => AutomatorTask)
  @Column({
    allowNull: false,
  })
  automatorTaskId: number

  @BelongsTo(() => AutomatorTask)
  automatorTask: AutomatorTask

}
