import path from 'path'
import { Service } from 'typedi'

@Service()
export class ConfigService {
  public config: any

  constructor() {
    try {
      const config = require(path.join(__dirname, '..', '..', '..', 'config.js'))
      this.config = config
    } catch (e) {
      console.error(e)
      process.exit()
    }

  }
}