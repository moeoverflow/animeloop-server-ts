import { Inject, Service } from 'jojo-base';
import { MinioService } from 'jojo-minio';
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
    const { bucketName } = this.configService.getConfig("minioS3")
    const storage = this.configService.getConfig("storage")
    return path.join(storage.dir.minio, bucketName, objectName)
  }

  async uploadFile(objectName: string, stream: internal.Stream | Buffer | string) {
    const { bucketName } = this.configService.getConfig("minioS3")
    await this.minioService.minio.putObject(bucketName, objectName, stream)
  }

  getPublicUrl(objectName: string | undefined | null) {
    if (!objectName) return null
    const { bucketName, bucketBaseUrl } = this.configService.getConfig("minioS3")
    return url.resolve(bucketBaseUrl, path.join(bucketName, objectName))
  }
}