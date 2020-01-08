import { BaseConfigService, Container } from 'jojo-base';
import { Service } from 'jojo-base';
import { ISequelizeConfig } from '../headers/sequelize.h';

interface IConfig {
  sequelize: ISequelizeConfig
}

@Service()
export class ConfigService extends BaseConfigService<IConfig> {
  constructor() {
    super(Container.get('project_config_filepath'))
  }
}
