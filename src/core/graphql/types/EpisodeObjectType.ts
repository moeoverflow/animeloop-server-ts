import { BaseParanoidObjectType, Field, ID, ObjectType } from "@jojo/graphql";
import { SeriesObjectType } from './SeriesObjectType';

@ObjectType()
export class EpisodeObjectType extends BaseParanoidObjectType {

  @Field()
  index: string;

  @Field(() => ID)
  readonly seriesId: number;

  @Field(() => SeriesObjectType)
  readonly series: SeriesObjectType
}