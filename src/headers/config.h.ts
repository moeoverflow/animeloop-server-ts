import { IAnilistConfig } from 'jojo-anilist';
import { IMinioConfig } from 'jojo-minio';
import { ISequelizeConfig } from 'jojo-sequelize';
import { ITransmissionConfig } from 'jojo-transmission';

export interface IProjectConfig {
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
    }
  }
  redis: {
    host: string
    port: number
    auth: string
    db: number
  }
  animeloopCli: {
    bin: string
  }
  api: {
    host: string
    port: number
  }
  automator: {}
  twitterBot: {}
  telegramBot: {}
}

export type IConfig =
  /**
   * project config
   */
  & IProjectConfig
  /**
   * jojo module config
   */
  & {
    sequelize: ISequelizeConfig
    minio: IMinioConfig
    transmission: ITransmissionConfig
    anilist: IAnilistConfig
  }
  /**
   * other config
   */
  & { [key: string]: any }
