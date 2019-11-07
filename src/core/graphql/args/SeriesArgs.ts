
import { ArgsType, Field } from '@jojo/graphql';

@ArgsType()
export class GetSeriesArgs {
  @Field({ nullable: true })
  titleLike?: string;

  @Field({ nullable: true })
  anilistId?: number;
}