import { BaseParanoidModel, BelongsTo, Column, ForeignKey, Sequelize, Table } from '@jojo/sequelize';
import { Series } from './Series';

@Table({
  indexes: [
    { unique: false, fields: ['seriesId'] },
  ]
})
export class Episode extends BaseParanoidModel<Episode> {
  @Column({
    type: Sequelize.TEXT,
    allowNull: false,
  })
  index: string

  @ForeignKey(() => Series)
  @Column({
    allowNull: false,
  })
  seriesId: number

  @BelongsTo(() => Series)
  series: Series
}
