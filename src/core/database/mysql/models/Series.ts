import { BaseParanoidModel, Column, enumWords, Sequelize, Table } from '@jojo/mysql';

export enum SeriesType {
  TV = 'tv',
  OVA = 'ova',
  Movie = 'movie',
}

@Table
export class Series extends BaseParanoidModel<Series> {
  @Column({
    type: Sequelize.STRING(128),
    allowNull: false,
  })
  title: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: false,
  })
  description: string

  @Column({
    type: Sequelize.ENUM(...enumWords(SeriesType)),
    allowNull: true,
  })
  type: SeriesType;

  @Column({
    type: Sequelize.STRING(256),
    allowNull: true,
  })
  cover: string

  @Column({
    type: Sequelize.STRING(256),
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
  anilistData: any
}
