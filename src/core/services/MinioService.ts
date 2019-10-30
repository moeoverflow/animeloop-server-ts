import * as Minio from 'minio'
import { Service } from 'typedi'
import { ConfigService } from './ConfigService'

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