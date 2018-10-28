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
    rss: ''
  },
  transmission: {
    host: 'localhost',
    port: 9091,
    username: '',
    password: '',
    ssl: false,
    url: '/transmission/rpc',
    downloadDir: ''
  }
}

module.exports = config;
