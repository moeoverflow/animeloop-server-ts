import { BaseConfigService, Container, Service } from 'jojo-base';
import { IProjectConfig } from '../../headers/config.h';

@Service()
export class ConfigService extends BaseConfigService<IProjectConfig> {
  constructor() {
    super(Container.get("project_config_filepath"))
  }
}
