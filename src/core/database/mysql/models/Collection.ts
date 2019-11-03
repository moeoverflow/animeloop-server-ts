import { BaseParanoidModel, Column, Sequelize, Table } from '@jojo/mysql';

@Table({
  indexes: [
    { unique: true, fields: ['slug'] },
  ]
})
export class Collection extends BaseParanoidModel<Collection> {

  @Column({
    type: Sequelize.STRING(64),
    allowNull: false,
  })
  slug: string

  @Column({
    type: Sequelize.STRING(64),
    allowNull: false,
  })
  name: string

  @Column({
    type: Sequelize.TEXT,
    allowNull: true,
  })
  description: string

  @Column({
    type: Sequelize.STRING(256),
    allowNull: true,
  })
  cover: string
}
