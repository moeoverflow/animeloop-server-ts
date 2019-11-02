import { buildSchema } from '@jojo/graphql';
import { Service } from 'typedi';
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
        ],
      })
    }
    return this.schema
  }
}