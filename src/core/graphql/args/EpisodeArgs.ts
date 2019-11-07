import { ArgsType, Field } from '@jojo/graphql';

@ArgsType()
export class GetEpisodeArgs {
  @Field({ nullable: true })
  seriesId?: number;
}