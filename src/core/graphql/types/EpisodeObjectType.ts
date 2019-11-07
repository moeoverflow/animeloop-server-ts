import { BaseObjectType, Field, ID, ObjectType } from "@jojo/graphql";
import { Series } from '../../database/postgresql/models/Series';
import { SeriesObjectType } from './SeriesObjectType';

@ObjectType()
export class EpisodeObjectType extends BaseObjectType {

  @Field()
  index: string;

  @Field(() => ID)
  readonly seriesId: number;

  @Field(() => SeriesObjectType, { nullable: true })
  series: Series
}