import { Field, ObjectType } from "type-graphql";
import { BaseObjectType } from './BaseObjectType';

@ObjectType()
export class BaseParanoidObjectType extends BaseObjectType {
  @Field()
  deletedAt: Date
}