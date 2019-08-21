const path = require('path')

const config = {
  mongodb: {
    url: 'mongodb://localhost:27017/animeloop-dev'
  },
  redis: {
    host: '127.0.0.1',
    port: 6379,
    auth: '',
    db: 10
  },
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
    }
  },
  storage: {
    dir: {
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
  traceMoe: {
    url: '',
    token: ''
  },
  anilist: {
    id: '',
    secret: '',
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
  sentry: {
    automator: ''
  }
}

module.exports = config;
