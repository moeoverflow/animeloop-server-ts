import { MinioService } from 'jojo-minio';
import { Inject, Service } from 'jojo-typedi';
import path from 'path';
import internal from 'stream';
import url from 'url';
import { ConfigService } from './ConfigService';

@Service()
export class MinioS3Service {

  @Inject(() => ConfigService) configService: ConfigService
  @Inject(() => MinioService) minioService: MinioService

  constructor() {
  }

  getLocalFilePath(objectName: string) {
    const { bucketName } = this.configService.config.s3
    const { storage } = this.configService.config
    return path.join(storage.dir.minio, bucketName, objectName)
  }

  async uploadFile(objectName: string, stream: internal.Stream | Buffer | string) {
    const { bucketName } = this.configService.config.s3
    await this.minioService.minio.putObject(bucketName, objectName, stream)
  }

  getPublicUrl(objectName: string | undefined | null) {
    if (!objectName) return null
    const { bucketName, bucketBaseUrl } = this.configService.config.s3
    return url.resolve(bucketBaseUrl, path.join(bucketName, objectName))
  }
}