import { Arg, Args, PaginationArgs, Query, Resolver } from "@jojo/graphql";
import { Sequelize } from '@jojo/sequelize';
import { pick } from 'lodash';
import { injectLoopsFileUrl } from '../../../utils/injectLoopsFileUrl';
import { Loop } from '../../database/postgresql/models/Loop';
import { GetLoopArgs } from '../args/LoopArgs';
import { LoopObjectType } from '../types/LoopObjectType';

@Resolver(LoopObjectType)
export class LoopResolver {

  constructor() {}

  @Query(() => LoopObjectType, { nullable: true })
  async loop(
    @Arg("id") id: number,
  ) {
    let loop = await Loop.findByPk(id);
    if (loop === undefined) {
      throw new Error('loop_not_found');
    }
    loop = injectLoopsFileUrl([loop])[0] as any
    return loop;
  }

  @Query(() => [LoopObjectType])
  async loops(
    @Args() pagination: PaginationArgs,
    @Args() args: GetLoopArgs,
  ) {
    const loops = await Loop.findAll({
      where: {
        ...pick(args, 'episodeId', 'seriesId', 'source'),
      },
      ...pagination,
    })
    return injectLoopsFileUrl(loops)
  }

  @Query(() => [LoopObjectType])
  async randomLoops(
    @Arg("limit") limit: number,
  ) {
    const loops = await Loop.findAll({
      order: Sequelize.literal('random()'),
      limit: limit,
    })
    return injectLoopsFileUrl(loops)
  }

}