import { ClassType, Field, ObjectType } from 'type-graphql';

export function Paginated<TItem>(TItemClass: ClassType<TItem>) {
  @ObjectType(`Paginated${TItemClass.name}Response`)
  class PaginatedResponseClass {
    @Field(() => [TItemClass])
    rows: TItem[];

    @Field()
    offset: number;

    @Field()
    limit: number;

    @Field()
    count: number;
  }
  return PaginatedResponseClass;
}