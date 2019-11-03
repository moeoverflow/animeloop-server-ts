import { FindOptions, Transaction, TransactionOptions } from 'sequelize';
import { Column, CreatedAt, Model, Table, UpdatedAt } from 'sequelize-typescript';
import { Sequelize } from '..';
import { IPaginationResult } from '../utils/Pagination';

@Table({
  freezeTableName: true,
})
export class BaseModel<T> extends Model<T> {

  @Column({
    type: Sequelize.STRING(64),
    allowNull: true,
  })
  mongodbId: string

  @CreatedAt
  createdAt: Date

  @UpdatedAt
  updatedAt: Date

  public static async transaction<T>(
    t?: Transaction | TransactionOptions,
    callback?: (transaction: Transaction) => PromiseLike<T>
  ): Promise<T> {
    if (t && (<Transaction>t).commit && (<Transaction>t).rollback) {
      return callback(t as Transaction);
    } else {
      return await this.sequelize.transaction((t as TransactionOptions) || {}, callback)
    }
  }

  public static async findAndCountAllWithPagination<T extends BaseModel<T>>(
    this: (new () => T),
    options?: FindOptions,
    offset?: number,
    limit?: number,
  ): Promise<IPaginationResult<T>> {
    const result = await (this as any).findAndCountAll({
      ...options as any,
      offset: offset,
      limit: limit,
    })
    return {
      rows: result.rows,
      count: result.count,
      offset: offset,
      limit: limit,
    }
  }
}
