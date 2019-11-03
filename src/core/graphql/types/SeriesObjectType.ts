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

  @Field()
  description: string;

  @Field(() => SeriesType)
  type: SeriesType;

  @Field()
  cover: string;

  @Field()
  banner: string;

  @Field()
  anilistId: number;

  @Field(() => GraphQLJSON)
  anilistData: any;

  @Field()
  anilistUpdatedAt: Date;
}