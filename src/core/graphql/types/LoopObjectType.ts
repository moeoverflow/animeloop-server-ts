import { BaseParanoidObjectType, Field, ID, ObjectType, registerEnumType } from "@jojo/graphql";
import { LoopFiles, LoopSource } from '../../database/mysql/models/Loop';
import { EpisodeObjectType } from './EpisodeObjectType';
import { SeriesObjectType } from './SeriesObjectType';

registerEnumType(LoopSource, {
  name: "LoopSource",
  description: "The loop sources",
});

@ObjectType()
export class LoopObjectType extends BaseParanoidObjectType {

  @Field(() => ID)
  readonly uuid: string;

  @Field()
  duration: number;

  @Field(() => LoopSource)
  source: LoopSource

  @Field()
  files: LoopFiles

  @Field(() => ID)
  readonly episodeId: number;

  @Field(() => EpisodeObjectType)
  readonly episode: EpisodeObjectType

  @Field(() => ID)
  readonly seriesId: number;

  @Field(() => SeriesObjectType)
  readonly series: SeriesObjectType
}