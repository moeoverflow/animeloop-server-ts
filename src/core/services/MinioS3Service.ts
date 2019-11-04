import internal from 'stream';
import { Inject, Service } from 'typedi';
import url from 'url';
import { MinioService } from '../../@jojo/minio';
import { ConfigService } from './ConfigService';

@Service()
export class MinioS3Service {

  @Inject(() => ConfigService) configService: ConfigService
  @Inject(() => MinioService) minioService: MinioService

  constructor() {
  }

  async uploadFile(objectName: string, stream: internal.Stream | Buffer | string) {
    const { bucketName } = this.configService.config.s3
    await this.minioService.minio.putObject(bucketName, objectName, stream)
  }

  getPublicUrl(objectName: string) {
    const { bucketName, bucketBaseUrl } = this.configService.config.s3
    return url.resolve(bucketBaseUrl, `${bucketName}/${objectName}`)
  }
}