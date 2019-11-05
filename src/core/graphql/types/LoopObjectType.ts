import { BaseParanoidObjectType, Field, GraphQLJSON, ID, ObjectType, registerEnumType } from "@jojo/graphql";
import { Episode } from '../../database/postgresql/models/Episode';
import { LoopFiles, LoopSource } from '../../database/postgresql/models/Loop';
import { Series } from '../../database/postgresql/models/Series';
import { EpisodeObjectType } from './EpisodeObjectType';
import { SeriesObjectType } from './SeriesObjectType';
import Container from 'typedi';
import { MinioS3Service } from '../../services/MinioS3Service';

registerEnumType(LoopSource, {
  name: "LoopSource",
  description: "The loop sources",
});

@ObjectType()
export class LoopObjectType extends BaseParanoidObjectType {

  @Field(() => ID)
  readonly uuid: string;

  @Field({ nullable: true })
  duration: number;

  @Field({ nullable: true })
  periodBegin: string;

  @Field({ nullable: true })
  periodEnd: string;

  @Field({ nullable: true })
  frameBegin: number;

  @Field({ nullable: true })
  frameEnd: number;

  @Field(() => LoopSource)
  source: LoopSource

  @Field(() => GraphQLJSON)
  files: LoopFiles

  @Field()
  readonly episodeId: number;

  @Field(() => EpisodeObjectType, { nullable: true })
  async episode() {
    return await Episode.findByPk(this.seriesId)
  }

  @Field()
  readonly seriesId: number;

  @Field(() => SeriesObjectType, { nullable: true })
  async series() {
    const minioS3Service = Container.get(MinioS3Service)
    const series = await Series.findByPk(this.seriesId)
    if (series.cover) series.cover = minioS3Service.getPublicUrl(series.cover)
    if (series.banner) series.banner = minioS3Service.getPublicUrl(series.banner)
    return series
  }
}