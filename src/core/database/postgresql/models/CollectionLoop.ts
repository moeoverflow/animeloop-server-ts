import { BaseParanoidModel, BelongsTo, Column, ForeignKey, Table } from 'jojo-sequelize';
import { Collection } from './Collection';
import { Loop } from './Loop';

@Table({
  indexes: [
    { unique: true, fields: ['collectionId', 'loopId'] },
  ]
})
export class CollectionLoop extends BaseParanoidModel<CollectionLoop> {

  @ForeignKey(() => Collection)
  @Column
  collectionId: number

  @BelongsTo(() => Collection)
  collection: Collection

  @ForeignKey(() => Loop)
  @Column
  loopId: number

  @BelongsTo(() => Loop)
  loop: Loop
}