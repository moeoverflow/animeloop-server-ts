import { Arg, Args, IRequestFields, PaginationArgs, Query, RequestFields, Resolver } from "jojo-graphql";
import { IncludeOptions } from 'jojo-sequelize';
import { Episode } from '../../database/postgresql/models/Episode';
import { Series } from '../../database/postgresql/models/Series';
import { GetEpisodeArgs } from '../args/EpisodeArgs';
import { EpisodeObjectType } from '../types/EpisodeObjectType';

function includeHelper(requestFields: IRequestFields, separate: boolean = false): IncludeOptions[] | undefined {
  if (!requestFields) return undefined
  const includeOptions: IncludeOptions[] = []
  if (requestFields.series) {
    includeOptions.push({
      model: Series,
      separate,
    })
  }
  return includeOptions
}

@Resolver(EpisodeObjectType)
export class EpisodeResolver {

  constructor() {}

  @Query(() => EpisodeObjectType, { nullable: true })
  async episode(
    @Arg("id") id: number,
    @RequestFields() requestFields: IRequestFields,
  ) {
    const episode = await Episode.findByPk(id, {
      include: includeHelper(requestFields.episode),
    });
    if (episode === undefined) {
      throw new Error('episode_not_found');
    }
    return episode
  }

  @Query(() => [EpisodeObjectType])
  async episodes(
    @Args() pagination: PaginationArgs,
    @Args() args: GetEpisodeArgs,
    @RequestFields() requestFields: IRequestFields,
  ) {
    const episodes = await Episode.findAll({
      where: {
        ...(args.seriesId ? {
          seriesId: args.seriesId,
        } : {}),
      },
      include: includeHelper(requestFields.episodes),
      ...pagination,
      order: [
        ['index', 'ASC'],
      ],
    })
    return episodes
  }

}