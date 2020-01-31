import path from 'path';
import { IConfig } from './headers/config.h';

const config: IConfig = {
  /**
   * jojo module config
   */
  sequelize: {
    database: 'animeloop_dev',
    dialect: 'postgres',
    username: 'root',
    password: 'password',
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    auth: '',
    db: 10
  },
  minio: {
    endPoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: '',
    secretKey: '',
  },
  mongodb: {
    url: 'mongodb://localhost:27017/animeloop-dev'
  },
  transmission: {
    host: 'localhost',
    port: 9091,
    username: '',
    password: '',
    ssl: false,
    url: '/transmission/rpc',
    downloadDir: ''
  },
  traceMoe: {
    url: '',
    token: ''
  },
  anilist: {
    id: '',
    secret: '',
  },
  twitter: {
    consumer_key:         '',
    consumer_secret:      '',
    access_token:         '',
    access_token_secret:  '',
    timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
  },
  telegram: {
    apiToken: '',
  },
  horribleSubs: {
    blacklist: [],
    rss: '',
    delayDays: 2
  },
  /**
   * project config
   */
  api: {
    host: '127.0.0.1',
    port: 8080,
  },
  automator: {},
  twitterBot: {},
  telegramBot: {},
  minioS3: {
    bucketName: 'animeloop-dev',
    bucketBaseUrl: 'http://127.0.0.1:9000',
  },
  storage: {
    dir: {
      minio: '/miniodata',
      data: path.join(__dirname, 'storage', 'data'),
      upload: path.join(__dirname, 'storage', 'upload'),
      raw: path.join(__dirname, 'storage', 'raw'),
      autogen: path.join(__dirname, 'storage', 'autogen'),
    },
  },
  animeloopCli: {
    bin: ''
  },
}

module.exports = config;
