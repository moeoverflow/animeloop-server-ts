import { IAnilistItem } from '@jojo/anilist';
import { BaseParanoidModel, Column, enumWords, Sequelize, Table } from '@jojo/sequelize';
import { DateTime } from 'luxon';

export enum SeriesType {
  TV = 'tv',
  OVA = 'ova',
  ONA = 'ona',
  Movie = 'movie',
  Special = 'special',
  Other = 'other'
}

@Table({
  indexes: [
    { unique: true, fields: ['anilistId'] }
  ]
})
export class Series extends BaseParanoidModel<Series> {

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  titleJA: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  titleROMAJI: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  titleCHS: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  titleCHT: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  titleEN: string

  @Column({
    type: Sequelize.DATE,
    allowNull: true,
  })
  startDate: Date

  @Column({
    type: Sequelize.DATE,
    allowNull: true,
  })
  endDate: Date

  @Column({
    type: Sequelize.ENUM(...enumWords(SeriesType)),
    allowNull: true,
  })
  type: SeriesType;

  @Column({
    type: Sequelize.JSON,
    allowNull: true,
  })
  genres: string[]

  @Column({
    type: Sequelize.BOOLEAN,
    allowNull: true,
  })
  isAdult: boolean

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  cover: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  banner: string

  @Column({
    type: Sequelize.BIGINT,
    allowNull: true,
  })
  anilistId: number

  @Column({
    type: Sequelize.JSON,
    allowNull: true,
  })
  anilistItem: IAnilistItem

  @Column({
    type: Sequelize.DATE,
    allowNull: true,
  })
  anilistUpdatedAt: Date

  @Column({
    type: Sequelize.VIRTUAL,
    get(this: Series) {
      if (this.startDate) {
        return DateTime.fromJSDate(this.startDate).toFormat('yyyy-MM')
      } else {
        return '1970-01'
      }
    }
  })
  season: string
}
