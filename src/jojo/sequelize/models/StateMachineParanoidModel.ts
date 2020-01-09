import { Transaction, TransactionOptions } from 'sequelize';
import { BaseParanoidModel } from './BaseParanoidModel';

export type TransitCallback<T> = (doc: T, transaction: Transaction) => Promise<any>;

export class StateMachineParanoidModel<T extends StateMachineParanoidModel<T, TStatus>, TStatus> extends BaseParanoidModel<T> {

  readonly status: TStatus

  public async transit(
    from: TStatus,
    to: TStatus,
    callback?: TransitCallback<this>,
    t?: Transaction | TransactionOptions,
  ): Promise<this> {
    const staticKlass = this.constructor as typeof StateMachineParanoidModel;

    if (this.status !== from) {
      throw new Error('current_status_mismatch')
    }

    return staticKlass.transaction(t, async (transaction: Transaction) => {
      (this as any).status = to;

      if (callback) {
        await callback(this, transaction);
      }

      const result = await this.save({ transaction });

      return result;
    });
  }
}
