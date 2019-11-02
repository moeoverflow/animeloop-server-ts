import { Column, Model, Table } from '@jojo/mysql';

@Table
export class User extends Model<User> {

  @Column
  name: string
}