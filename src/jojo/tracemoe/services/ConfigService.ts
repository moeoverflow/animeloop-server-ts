import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { ITraceMoeConfig } from '../headers/tracemoe.h';

interface IConfig {
  traceMoe: ITraceMoeConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
