import { Arg, Args, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { Series } from '../../../core/database/mysql/models/Series';
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
  async serieses(@Args() pagination: PaginationArgs) {
    const serieses = await Series.findAll({
      offset: pagination.offset,
      limit: pagination.limit,
    })
    return serieses
  }

}