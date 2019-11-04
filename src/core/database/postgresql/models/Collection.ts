import { BaseParanoidModel, Column, Sequelize, Table } from '@jojo/sequelize';

@Table({
  indexes: [
    { unique: true, fields: ['slug'] },
  ]
})
export class Collection extends BaseParanoidModel<Collection> {

  @Column({
    type: Sequelize.TEXT,
    allowNull: false,
  })
  slug: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: false,
  })
  name: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  description: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  cover: string
}
