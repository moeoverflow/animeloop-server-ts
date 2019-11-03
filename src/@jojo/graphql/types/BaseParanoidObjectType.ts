import { Field, ObjectType } from "type-graphql";
import { BaseObjectType } from './BaseObjectType';

@ObjectType()
export class BaseParanoidObjectType extends BaseObjectType {
  @Field({ nullable: true })
  deletedAt: Date
}