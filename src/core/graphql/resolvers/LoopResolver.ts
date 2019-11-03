import { Arg, Args, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { pick } from 'lodash';
import { Loop } from '../../../core/database/mysql/models/Loop';
import { GetLoopArgs } from '../args/LoopArgs';
import { LoopObjectType } from '../types/LoopObjectType';

@Resolver(LoopObjectType)
export class LoopResolver {

  constructor() {}

  @Query(() => LoopObjectType, { nullable: true })
  async loop(
    @Arg("id") id: number,
  ) {
    const series = await Loop.findByPk(id);
    if (series === undefined) {
      throw new Error('series_not_found');
    }
    return series;
  }

  @Query(() => [LoopObjectType])
  async loops(
    @Args() pagination: PaginationArgs,
    @Args() args: GetLoopArgs,
  ) {
    const serieses = await Loop.findAll({
      where: {
        ...pick(args, 'episodeId', 'seriesId', 'source'),
      },
      ...pagination,
    })
    return serieses.map((i) => i.toJSON())
  }

}