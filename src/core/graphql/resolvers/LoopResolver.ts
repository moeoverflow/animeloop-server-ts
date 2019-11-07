import { Arg, Args, FieldResolver, GraphQLJSON, IRequestFields, PaginationArgs, Query, RequestFields, Resolver, Root } from "@jojo/graphql";
import { IncludeOptions, Sequelize } from '@jojo/sequelize';
import { Container } from '@jojo/typedi';
import { clone, pick } from 'lodash';
import { Episode } from '../../database/postgresql/models/Episode';
import { Loop } from '../../database/postgresql/models/Loop';
import { Series } from '../../database/postgresql/models/Series';
import { MinioS3Service } from '../../services/MinioS3Service';
import { GetLoopArgs } from '../args/LoopArgs';
import { LoopObjectType } from '../types/LoopObjectType';

function includeHelper(requestFields: IRequestFields, separate: boolean = false): IncludeOptions[] | undefined {
  if (!requestFields) return undefined
  const includeOptions: IncludeOptions[] = []
  if (requestFields.series) {
    includeOptions.push({
      model: Series,
      separate,
    })
  }
  if (requestFields.episode) {
    includeOptions.push({
      model: Episode,
      separate,
    })
  }
  return includeOptions
}

@Resolver(LoopObjectType)
export class LoopResolver {

  constructor() {}

  @Query(() => LoopObjectType, { nullable: true })
  async loop(
    @Arg("uuid") uuid: string,
    @RequestFields() requestFields: IRequestFields,
  ) {
    const condition = uuid.length === 24 ? { mongodbId: uuid } : { uuid }
    const loop = await Loop.findOne({
      where: condition,
      include: includeHelper(requestFields.loop),
    });
    if (loop === undefined) {
      throw new Error('loop_not_found');
    }
    return loop
  }

  @Query(() => [LoopObjectType])
  async loops(
    @Args() pagination: PaginationArgs,
    @Args() args: GetLoopArgs,
    @RequestFields() requestFields: IRequestFields,
  ) {
    const loops = await Loop.findAll({
      where: {
        ...pick(args, 'episodeId', 'seriesId', 'source'),
      },
      include: includeHelper(requestFields.loops),
      ...pagination,
    })
    return loops
  }

  @Query(() => [LoopObjectType])
  async randomLoops(
    @Arg("limit") limit: number,
    @RequestFields() requestFields: IRequestFields,
  ) {
    const loops = await Loop.findAll({
      order: Sequelize.literal('random()'),
      limit: limit,
      include: includeHelper(requestFields.randomLoops),
    })
    return loops
  }

  @FieldResolver(() => GraphQLJSON, { nullable: true })
  files(@Root() loop: Loop) {
    const minioS3Service = Container.get(MinioS3Service)
    const _files = clone(loop.files)
    for (const key of Object.keys(_files)) {
      _files[key] = minioS3Service.getPublicUrl(_files[key])
    }
    return _files
  }

}