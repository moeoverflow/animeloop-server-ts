import { Arg, Args, FieldResolver, IRequestFields, PaginationArgs, Query, RequestFields, Resolver, Root } from "@jojo/graphql";
import { IncludeOptions, Sequelize } from '@jojo/sequelize';
import { clone, pick } from 'lodash';
import Container from 'typedi';
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
    @Arg("id") id: number,
    @RequestFields() requestFields: IRequestFields,
  ) {
    const loop = await Loop.findByPk(id, {
      include: includeHelper(requestFields.loop),
    });
    if (loop === undefined) {
      throw new Error('loop_not_found');
    }
    return loop.toJSON();
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
    return loops.map((i) => i.toJSON())
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
    return loops.map((i) => i.toJSON())
  }

  @FieldResolver()
  files(@Root() loop: Loop) {
    const minioS3Service = Container.get(MinioS3Service)
    const _files = clone(loop.files)
    for (const key of Object.keys(_files)) {
      _files[key] = minioS3Service.getPublicUrl(_files[key])
    }
    return _files
  }

}