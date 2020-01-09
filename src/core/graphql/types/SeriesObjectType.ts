import { IAnilistItem } from 'jojo-anilist';
import { BaseObjectType, Field, GraphQLJSON, GraphQLString, ObjectType, registerEnumType } from "jojo-graphql";
import { SeriesType } from '../../database/postgresql/models/Series';

registerEnumType(SeriesType, {
  name: "SeriesType",
  description: "The series type",
});

@ObjectType()
export class SeriesObjectType extends BaseObjectType {

  @Field(() => GraphQLString)
  readonly uuid: string;

  @Field({ nullable: true })
  titleJA: string;

  @Field({ nullable: true })
  titleROMAJI: string;

  @Field({ nullable: true })
  titleCHS: string;

  @Field({ nullable: true })
  titleCHT: string;

  @Field({ nullable: true })
  titleEN: string;

  @Field({ nullable: true })
  startDate: Date;

  @Field({ nullable: true })
  endDate: Date;

  @Field(() => SeriesType, { nullable: true })
  type: SeriesType;

  @Field(() => GraphQLJSON, { nullable: true })
  genres: string[];

  @Field({ nullable: true })
  isAdult: boolean;

  @Field({ nullable: true })
  cover: string;

  @Field({ nullable: true })
  banner: string;

  @Field({ nullable: true })
  anilistId: number;

  @Field(() => GraphQLJSON, { nullable: true })
  anilistItem: IAnilistItem;

  @Field({ nullable: true })
  anilistUpdatedAt: Date;

  @Field({ nullable: true })
  season: string;
}