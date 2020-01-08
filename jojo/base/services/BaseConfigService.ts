import { errors } from 'errorjs';
import { Service } from 'jojo-base';

@Service()
export class BaseConfigService<T extends Object> {
  private config: T

  constructor(filename: string) {
    try {
      const config = require(filename)
      this.config = config
    } catch (e) {
      console.error(e)
      process.exit()
    }
  }

  getConfig<K extends keyof T>(name: K) {
    const moduleConfig = this.config[name]
    if (!moduleConfig) {
      throw new errors.NotFoundError(`${name}_config_not_found`)
    }
    return moduleConfig
  }
}
