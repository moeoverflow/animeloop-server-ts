const path = require('path')

const config = {
  /**
   * Third-party Service
   */
  sequelize: {
    database: 'animeloop_dev',
    dialect: 'postgres',
    username: 'root',
    password: 'password',
  },
  mongodb: {
    url: 'mongodb://localhost:27017/animeloop-dev'
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    auth: '',
    db: 10
  },
  minio: {
    endpoint: '127.0.0.1',
    port: 9000,
    useSSL: false,
    accessKey: '',
    secretKey: '',
  },
  s3: {
    bucketName: 'animeloop-dev',
    bucketBaseUrl: 'http://127.0.0.1:9000',
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
  sentry: {
    automator: ''
  },
  /**
   * Modules
   */
  api: {
    host: '127.0.0.1',
    port: 7775,
    session: {
      name: 'auth.sid',
      secret: 'animeloop',
      redisStore: {
        host: '127.0.0.1',
        port: '6379',
        db: 10,
      }
    },
  },

  bot: {
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
  horribleSubs: {
    blacklist: [],
    rss: '',
    delayDays: 2
  },
}

module.exports = config;
