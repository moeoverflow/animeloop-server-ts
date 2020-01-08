import { Service } from 'jojo-base'
import * as Minio from 'minio'
import { ConfigService } from './ConfigService'

@Service()
export class MinioService {
  public minio: Minio.Client

  constructor(configService: ConfigService) {
    const config = configService.getConfig("minio")
    this.minio = new Minio.Client(config)
  }
}