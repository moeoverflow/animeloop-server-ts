import { DeletedAt } from "sequelize-typescript";
import { BaseModel } from "./BaseModel";

export class BaseParanoidModel<T extends BaseParanoidModel<T>> extends BaseModel<T> {

  @DeletedAt
  deletedAt: Date

}
