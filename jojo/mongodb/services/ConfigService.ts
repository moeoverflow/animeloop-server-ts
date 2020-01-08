import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { IMongodbConfig } from '../headers/mongodb.h';

interface IConfig {
  mongodb: IMongodbConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
