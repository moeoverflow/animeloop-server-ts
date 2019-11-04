import { Arg, Args, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { Episode } from '../../database/postgresql/models/Episode';
import { GetEpisodeArgs } from '../args/EpisodeArgs';
import { EpisodeObjectType } from '../types/EpisodeObjectType';

@Resolver(EpisodeObjectType)
export class EpisodeResolver {

  constructor() {}

  @Query(() => EpisodeObjectType, { nullable: true })
  async episode(@Arg("id") id: number) {
    const episode = await Episode.findByPk(id);
    if (episode === undefined) {
      throw new Error('episode_not_found');
    }
    return episode;
  }

  @Query(() => [EpisodeObjectType])
  async episodes(
    @Args() pagination: PaginationArgs,
    @Args() args: GetEpisodeArgs,
  ) {
    const episodes = await Episode.findAll({
      where: {
        ...(args.seriesId ? {
          seriesId: args.seriesId,
        } : {}),
      },
      ...pagination,
    })
    return episodes.map((i) => i.toJSON())
  }

}