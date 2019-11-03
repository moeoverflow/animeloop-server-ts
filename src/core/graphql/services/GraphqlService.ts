import { buildSchema } from '@jojo/graphql';
import { Service } from 'typedi';
import { EpisodeResolver } from '../resolvers/EpisodeResolver';
import { LoopResolver } from '../resolvers/LoopResolver';
import { SeriesResolver } from '../resolvers/SeriesResolver';

@Service()
export class GraphqlService {
  public schema: any

  constructor() {
  }

  async getSchema() {
    if (!this.schema) {
      this.schema = await buildSchema({
        resolvers: [
          SeriesResolver,
          EpisodeResolver,
          LoopResolver,
        ],
      })
    }
    return this.schema
  }
}