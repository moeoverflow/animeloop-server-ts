import path from 'path'
import { Inject, Service } from 'typedi'
import { ConfigService } from './ConfigService'

@Service()
export class MinioS3Service {

  @Inject(() => ConfigService) configService: ConfigService

  constructor() {
  }

  getPublicUrl(objectName: string) {
    const { bucketName, bucketBaseUrl } = this.configService.config.s3
    return path.join(bucketBaseUrl, `/${bucketName}/`, objectName)
  }
}