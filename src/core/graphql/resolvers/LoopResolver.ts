import { Arg, Args, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { pick } from 'lodash';
import Container from 'typedi';
import { Loop } from '../../../core/database/mysql/models/Loop';
import { MinioS3Service } from '../../services/MinioS3Service';
import { GetLoopArgs } from '../args/LoopArgs';
import { LoopObjectType } from '../types/LoopObjectType';

@Resolver(LoopObjectType)
export class LoopResolver {

  constructor() {}

  @Query(() => LoopObjectType, { nullable: true })
  async loop(
    @Arg("id") id: number,
  ) {
    const loop = await Loop.findByPk(id);
    if (loop === undefined) {
      throw new Error('loop_not_found');
    }
    return loop;
  }

  @Query(() => [LoopObjectType])
  async loops(
    @Args() pagination: PaginationArgs,
    @Args() args: GetLoopArgs,
  ) {
    const minioS3Service = Container.get(MinioS3Service)
    const loops = await Loop.findAll({
      where: {
        ...pick(args, 'episodeId', 'seriesId', 'source'),
      },
      ...pagination,
    })
    return loops.map((i) => {
      for (const key of Object.keys(i.files)) {
        i.files[key] = minioS3Service.getPublicUrl(i.files[key])
      }
      return i.toJSON()
    })
  }

}