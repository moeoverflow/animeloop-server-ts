import { Arg, Args, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { Op } from "@jojo/sequelize";
import Container from 'typedi';
import { Series } from '../../database/postgresql/models/Series';
import { MinioS3Service } from '../../services/MinioS3Service';
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
    const minioS3Service = Container.get(MinioS3Service)
    return serieses.map((i) => {
      if (i.cover) i.cover = minioS3Service.getPublicUrl(i.cover)
      if (i.banner) i.banner = minioS3Service.getPublicUrl(i.banner)
      return i.toJSON()
    })
  }

}