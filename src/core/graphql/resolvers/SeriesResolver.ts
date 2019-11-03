import { Arg, Args, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { Op } from "@jojo/mysql";
import { Series } from '../../../core/database/mysql/models/Series';
import { GetSeriesArgs } from '../args/SeriesArgs';
import { SeriesObjectType } from '../types/SeriesObjectType';

@Resolver(SeriesObjectType)
export class SeriesResolver {

  constructor() {}

  @Query(() => SeriesObjectType, { nullable: true })
  async series(@Arg("id") id: number) {
    const series = await Series.findByPk(id);
    if (series === undefined) {
      throw new Error('series_not_found');
    }
    return series;
  }

  @Query(() => [SeriesObjectType])
  async serieses(
    @Args() pagination: PaginationArgs,
    @Args() args: GetSeriesArgs,
  ) {
    const serieses = await Series.findAll({
      where: {
        ...(args.titleLike ? {
          title: {
            [Op.like]: `%${args.titleLike}%`,
          },
        } : {}),
        ...(args.anilistId ? {
          anilistId: args.anilistId,
        } : {}),
      },
      ...pagination,
    })
    return serieses.map((i) => i.toJSON())
  }

}