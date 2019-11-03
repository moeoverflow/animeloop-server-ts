import { BaseParanoidModel, BelongsTo, Column, enumWords, ForeignKey, Sequelize, Table } from '@jojo/mysql';
import { Episode } from './Episode';
import { Series } from './Series';

export enum LoopSource {
  Automator = 'automator',
  UserUpload = 'userUpload',
}

export enum LoopFileType {
  MP4_1080P = 'mp4_1080p'
}

export interface LoopFiles {
  [key: string]: string
}

@Table({
  indexes: [
    { unique: true, fields: ['uuid'] },
    { unique: false, fields: ['seriesId', 'episodeId'] },
  ]
})
export class Loop extends BaseParanoidModel<Loop> {

  @Column({
    type: Sequelize.STRING(128),
    allowNull: false,
  })
  uuid: string

  @Column({
    type: Sequelize.FLOAT,
    allowNull: true,
  })
  duration: number

  @Column({
    type: Sequelize.STRING(32),
    allowNull: true,
  })
  periodBegin: string

  @Column({
    type: Sequelize.STRING(32),
    allowNull: true,
  })
  periodEnd: string

  @Column({
    type: Sequelize.INTEGER,
    allowNull: true,
  })
  frameBegin: number

  @Column({
    type: Sequelize.INTEGER,
    allowNull: true,
  })
  frameEnd: number

  @Column({
    type: Sequelize.ENUM(...enumWords(LoopSource)),
    allowNull: false,
  })
  source: LoopSource;

  @Column({
    type: Sequelize.JSON,
    allowNull: true,
    defaultValue: {},
  })
  files: LoopFiles

  @ForeignKey(() => Episode)
  @Column({
    allowNull: false,
  })
  episodeId: number

  @BelongsTo(() => Episode)
  episode: Episode

  @ForeignKey(() => Series)
  @Column({
    allowNull: false,
  })
  seriesId: number

  @BelongsTo(() => Series)
  series: Series
}
