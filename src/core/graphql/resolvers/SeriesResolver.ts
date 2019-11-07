import { Arg, Args, FieldResolver, GraphQLString, Paginated, PaginationArgs, Query, Resolver, Root } from "@jojo/graphql";
import { Op } from "@jojo/sequelize";
import { Inject, Service } from '@jojo/typedi';
import { Series } from '../../database/postgresql/models/Series';
import { MinioS3Service } from '../../services/MinioS3Service';
import { GetSeriesArgs } from '../args/SeriesArgs';
import { SeriesObjectType } from '../types/SeriesObjectType';

const PaginatedSeriesObjectType = Paginated(SeriesObjectType)

@Resolver(SeriesObjectType)
@Service()
export class SeriesResolver {

  @Inject(() => MinioS3Service) minioS3Service: MinioS3Service

  constructor() {}

  @Query(() => SeriesObjectType, { nullable: true })
  async series(@Arg("id") id: number) {
    const series = await Series.findByPk(id);
    if (series === undefined) {
      throw new Error('series_not_found');
    }
    return series;
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
      order: [
        ['startDate', 'DESC NULLS LAST'],
      ],
    }, pagination.offset, pagination.limit)
    return serieses
  }

  @FieldResolver(() => GraphQLString, { nullable: true })
  cover(@Root() series: Series) {
    return this.minioS3Service.getPublicUrl(series.cover)
  }

  @FieldResolver(() => GraphQLString, { nullable: true })
  banner(@Root() series: Series) {
    return this.minioS3Service.getPublicUrl(series.banner)
  }

}