import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { ITelegramConfig } from '../headers/telegram.h';

interface IConfig {
  telegram: ITelegramConfig
}

@Service()
export default class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
