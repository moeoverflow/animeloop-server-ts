import { Inject, Service } from 'typedi';
import url from 'url';
import { ConfigService } from './ConfigService';

@Service()
export class MinioS3Service {

  @Inject(() => ConfigService) configService: ConfigService

  constructor() {
  }

  getPublicUrl(objectName: string) {
    const { bucketName, bucketBaseUrl } = this.configService.config.s3
    return url.resolve(bucketBaseUrl, `${bucketName}/${objectName}`)
  }
}