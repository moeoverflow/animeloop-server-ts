import { Column, Model, Table } from '@jojo/sequelize';

@Table
export class User extends Model<User> {

  @Column
  name: string
}