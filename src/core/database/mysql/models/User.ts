import { Column, Model, Table } from 'sequelize-typescript'

@Table
export class User extends Model<User> {

  @Column
  name: string
}