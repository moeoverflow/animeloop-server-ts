import { BaseParanoidObjectType, Field, ID, ObjectType } from "@jojo/graphql";
import Container from 'typedi';
import { Series } from '../../database/postgresql/models/Series';
import { MinioS3Service } from '../../services/MinioS3Service';
import { SeriesObjectType } from './SeriesObjectType';

@ObjectType()
export class EpisodeObjectType extends BaseParanoidObjectType {

  @Field()
  index: string;

  @Field(() => ID)
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