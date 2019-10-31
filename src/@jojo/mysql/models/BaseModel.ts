import { Transaction, TransactionOptions } from 'sequelize';
import { CreatedAt, Model, UpdatedAt } from 'sequelize-typescript';

export class BaseModel<T> extends Model<T> {

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
}
