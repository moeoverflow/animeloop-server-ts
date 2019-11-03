import { BaseParanoidObjectType, Field, GraphQLJSON, ID, ObjectType, registerEnumType } from "@jojo/graphql";
import { SeriesType } from '../../database/mysql/models/Series';

registerEnumType(SeriesType, {
  name: "SeriesType",
  description: "The series type",
});

@ObjectType()
export class SeriesObjectType extends BaseParanoidObjectType {

  @Field(() => ID)
  readonly uuid: string;

  @Field()
  title: string;

  @Field(() => SeriesType, { nullable: true })
  type: SeriesType;

  @Field({ nullable: true })
  cover: string;

  @Field({ nullable: true })
  banner: string;

  @Field({ nullable: true })
  anilistId: number;

  @Field(() => GraphQLJSON, { nullable: true })
  anilistData: any;

  @Field({ nullable: true })
  anilistUpdatedAt: Date;
}