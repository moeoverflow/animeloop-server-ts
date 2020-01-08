import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { IHorribleSubsConfig } from '../headers/horriblesubs.h';

interface IConfig {
  horribleSubs: IHorribleSubsConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
