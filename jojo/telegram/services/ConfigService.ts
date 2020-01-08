import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { ITelegramConfig } from '../index.h';

interface IConfig {
  telegram: ITelegramConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
