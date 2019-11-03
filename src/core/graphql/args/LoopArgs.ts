
import { ArgsType, Field } from '@jojo/graphql';
import { LoopSource } from '../../database/mysql/models/Loop';

@ArgsType()
export class GetLoopArgs {

  @Field(() => LoopSource, { nullable: true })
  source?: LoopSource;

  @Field({ nullable: true })
  seriesId?: number;

  @Field({ nullable: true })
  episodeId?: number;
}