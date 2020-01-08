import { Container, Service } from 'jojo-base';
import { buildSchema } from 'jojo-graphql';
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
        container: Container,
      })
    }
    return this.schema
  }
}