import { BaseConfigService, Service } from 'jojo-base';
import path from 'path';

interface IConfig {
  minioS3: {
    bucketName: string
    bucketBaseUrl: string,
  }
  storage: {
    dir: {
      minio: string
      data: string
      upload: string
      raw: string
      autogen: string
    },
  },
  redis: {
    host: string
    port: number
    auth: string
    db: number
  },
  animeloopCli: {
    bin: string
  }
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(path.join(__dirname, '../../../config.js'))
  }
}
