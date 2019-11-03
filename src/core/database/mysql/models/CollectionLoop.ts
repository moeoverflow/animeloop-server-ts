import { BaseParanoidModel, BelongsTo, Column, ForeignKey, Table } from '@jojo/mysql';
import { Collection } from './Collection';
import { Loop } from './Loop';

@Table
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