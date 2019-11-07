import { Column, enumWords, FindOptions, HasMany, Sequelize, StateMachineParanoidModel, Table } from '@jojo/sequelize';
import { AnimeloopTask } from './AnimeloopTask';

export enum AutomatorTaskStatus {
  Created = 'created',
  Downloading = 'downloading',
  Downloaded = 'downloaded',
  Animelooping = 'animelooping',
  Animelooped = 'animelooped',
  Adding = 'adding',
  Done = 'done'
}

@Table
export class AutomatorTask extends StateMachineParanoidModel<AutomatorTask, AutomatorTaskStatus> {
  @Column({
    type: Sequelize.ENUM(...enumWords(AutomatorTaskStatus)),
    allowNull: false,
    defaultValue: AutomatorTaskStatus.Created,
  })
  readonly status: AutomatorTaskStatus

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  name: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: false,
  })
  magnetLink: string

  @Column({
    type: Sequelize.INTEGER(),
    allowNull: true,
  })
  transmissionId: number

  @Column({
    type: Sequelize.JSON,
    allowNull: true,
  })
  files: string[]

  @HasMany(() => AnimeloopTask)
  animeloopTasks: AnimeloopTask[]

  getAnimeloopTasks: (options?: FindOptions) => Promise<AnimeloopTask[] | null>
}
