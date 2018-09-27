import { Service } from 'typedi'
import path from 'path'



@Service()
export class ConfigService {
  public config: any

  constructor() {
    console.log(path.join(__dirname, '..', '..', '..', 'config.js'))

    try {
      const config = require(path.join(__dirname, '..', '..', '..', 'config.js'))
      this.config = config
    } catch (e) {
      console.error(e)
      process.exit()
    }

  }
}