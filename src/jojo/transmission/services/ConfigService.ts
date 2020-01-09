import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { ITransmissionConfig } from '../headers/transmission.h';

interface IConfig {
  transmission: ITransmissionConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
