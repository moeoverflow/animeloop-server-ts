import { Service } from 'typedi'
import { TransmissionService } from './TransmissionService'

@Service()
export class AutomatorTaskService {
  constructor(
    protected transmissionService: TransmissionService
  ) {
  }

}