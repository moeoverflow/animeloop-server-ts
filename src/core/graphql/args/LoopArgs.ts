
import { ArgsType, Field } from '@jojo/graphql';
import { LoopSource } from '../../database/postgresql/models/Loop';
@ArgsType()
export class GetLoopArgs {

  @Field(() => LoopSource, { nullable: true })
  source?: LoopSource;

  @Field({ nullable: true })
  seriesId?: number;

  @Field({ nullable: true })
  episodeId?: number;

  @Field({ nullable: true })
  collectionId?: number;

  @Field({ nullable: true })
  collectionSlug?: string;
}