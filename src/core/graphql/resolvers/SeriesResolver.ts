import { Arg, Args, Paginated, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { Op } from "@jojo/sequelize";
import Container from 'typedi';
import { Series } from '../../database/postgresql/models/Series';
import { MinioS3Service } from '../../services/MinioS3Service';
import { GetSeriesArgs } from '../args/SeriesArgs';
import { SeriesObjectType } from '../types/SeriesObjectType';

const PaginatedSeriesObjectType = Paginated(SeriesObjectType)

@Resolver(SeriesObjectType)
export class SeriesResolver {

  constructor() {}

  @Query(() => SeriesObjectType, { nullable: true })
  async series(@Arg("id") id: number) {
    const series = await Series.findByPk(id);
    if (series === undefined) {
      throw new Error('series_not_found');
    }
    const minioS3Service = Container.get(MinioS3Service)
    if (series.cover) series.cover = minioS3Service.getPublicUrl(series.cover)
    if (series.banner) series.banner = minioS3Service.getPublicUrl(series.banner)
    return series.toJSON();
  }

  @Query(() => [String], { nullable: true })
  async season() {
    const serieses = await Series.findAll({
      attributes: ['startDate'],
    });
    return Array.from(new Set(serieses.map((i) => i.season)))
  }

  @Query(() => PaginatedSeriesObjectType)
  async serieses(
    @Args() pagination: PaginationArgs,
    @Args() args: GetSeriesArgs,
  ) {
    const serieses = await Series.findAndCountAllWithPagination({
      where: {
        ...(args.titleLike ? {
          [Op.or]: [
            { titleCHS: { [Op.like]: `%${args.titleLike}%` } },
            { titleCHT: { [Op.like]: `%${args.titleLike}%` } },
            { titleJA: { [Op.like]: `%${args.titleLike}%` } },
            { titleROMAJI: { [Op.like]: `%${args.titleLike}%` } },
            { titleEN: { [Op.like]: `%${args.titleLike}%` } },
          ],
        } : {}),
        ...(args.anilistId ? {
          anilistId: args.anilistId,
        } : {}),
      },
    }, pagination.offset, pagination.limit)
    const minioS3Service = Container.get(MinioS3Service)
    return {
      ...serieses,
      rows: serieses.rows.map((i) => {
        if (i.cover) i.cover = minioS3Service.getPublicUrl(i.cover)
        if (i.banner) i.banner = minioS3Service.getPublicUrl(i.banner)
        return i.toJSON()
      })
    }
  }

}