import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { ITwitterConfig } from '../headers/twitter.h';

interface IConfig {
  twitter: ITwitterConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
