import { Field, ID, ObjectType } from "type-graphql";

@ObjectType()
export class BaseObjectType {
  @Field(() => ID)
  id: number;

  @Field()
  createdAt: Date

  @Field()
  updatedAt: Date

}