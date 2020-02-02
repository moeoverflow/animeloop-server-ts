import { errors } from 'errorjs';
import { Service } from 'jojo-base';
import { Collection } from '../database/postgresql/models/Collection';
import { CollectionLoop } from '../database/postgresql/models/CollectionLoop';
import { Loop } from '../database/postgresql/models/Loop';

@Service()
export class LoopService {
  async findRandomIds(conditions: {
    limit: number
    collectionId?: number
    collectionSlug?: string
  }) {

    if (conditions.collectionId || conditions.collectionSlug) {
      const estimateCountResult = await Loop.sequelize.query(`
        SELECT reltuples::bigint AS estimate FROM pg_class where relname='CollectionLoop';
      `)
      const estimateCount = parseInt((estimateCountResult[0][0] as any).estimate, 10)
      let collectionId = conditions.collectionId
      if (!conditions.collectionId && conditions.collectionSlug) {
        const collection = await Collection.findOne({
          where: {
            slug: conditions.collectionSlug
          },
          raw: true,
          attributes: ['id'],
        })
        if (collection) {
          collectionId = collection.id
        }
      }
      if (!collectionId) {
        throw new errors.NotFoundError('collection_not_found')
      }
      const ids = await CollectionLoop.sequelize.query(`
        SELECT "CollectionLoop"."loopId"
        FROM  (
            SELECT DISTINCT 1 + trunc(random() * ${estimateCount})::integer AS id
            FROM   generate_series(1, ${conditions.limit * 2}) g
            ) r
        JOIN   "CollectionLoop" USING (id)
        INNER JOIN "Loop" ON "Loop"."id" = "CollectionLoop"."loopId"
        WHERE "CollectionLoop"."collectionId" = ${collectionId}
        LIMIT ${conditions.limit};
      `)
      return ids[0].map((i: any) => i.loopId)
    } else {
      const estimateCountResult = await Loop.sequelize.query(`
        SELECT reltuples::bigint AS estimate FROM pg_class where relname='Loop';
      `)
      const estimateCount = parseInt((estimateCountResult[0][0] as any).estimate, 10)
      const ids = await Loop.sequelize.query(`
        SELECT "Loop"."id"
        FROM  (
            SELECT DISTINCT 1 + trunc(random() * ${estimateCount})::integer AS id
            FROM   generate_series(1, ${conditions.limit * 2}) g
            ) r
        JOIN   "Loop" USING (id)
        LIMIT ${conditions.limit};
      `)
      return ids[0].map((i: any) => i.id)
    }
  }
}
