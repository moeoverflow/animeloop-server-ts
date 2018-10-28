import log4js from 'log4js'
import { Service } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'

const logger = log4js.getLogger('Automator:Service:TraceMoeService')

export interface ITraceMoeItem {

}

/**
 * Fetch video source from HorribleSubs
 */
@Service()
export class TraceMoeService {
  constructor (
    private configService: ConfigService
  ) {}

}
