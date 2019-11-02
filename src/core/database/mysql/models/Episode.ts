import { BaseParanoidModel, BelongsTo, Column, ForeignKey, Sequelize, Table } from '@jojo/mysql';
import { Series } from './Series';

@Table
export class Episode extends BaseParanoidModel<Episode> {
  @Column({
    type: Sequelize.STRING(32),
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
