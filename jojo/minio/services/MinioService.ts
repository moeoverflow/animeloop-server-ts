import { Service } from 'jojo-typedi'
import * as Minio from 'minio'
import { ConfigService } from '../../../src/core/services/ConfigService'

@Service()
export class MinioService {
  public minio: Minio.Client

  constructor(configService: ConfigService) {
    const config = configService.config.minio
    this.minio = new Minio.Client({
      endPoint: config.endpoint,
      port: config.port,
      useSSL: config.useSSL,
      accessKey: config.accessKey,
      secretKey: config.secretKey,
    })
  }
}