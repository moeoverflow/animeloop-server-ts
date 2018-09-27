const config = {
  mongodb: {
    url: 'mongodb://localhost:27017/animeloop-dev'
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
  }
}

module.exports = config;
