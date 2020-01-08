import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { IMinioConfig } from '../headers/minio.h';

interface IConfig {
  minio: IMinioConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
