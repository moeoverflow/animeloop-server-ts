import { Min } from 'class-validator';
import { ArgsType, Field } from "type-graphql";

@ArgsType()
export class PaginationArgs {
  @Field()
  @Min(0)
  offset: number = 0;

  @Field()
  limit: number = 50;
}