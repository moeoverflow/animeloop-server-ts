import { Service } from 'typedi'
import { AutomatorTaskModel, AutomatorTaskStatus } from '../../core/database/model/AutomatorTask'
import { TransmissionService } from './TransmissionService'
import { IHorribleSubsItem } from './HorribleSubsService'
import { ITraceMoeItem } from './TraceMoeService'

@Service()
export class AutomatorTaskService {
  constructor(
    protected transmissionService: TransmissionService
  ) {
  }

  public async findOrCreate(task: {
    name: string
    magnetLink: string
    horribleSubsItem?: IHorribleSubsItem
    traceMoeItem?: ITraceMoeItem
  }) {
    const doc = Object.assign(task, {
      status: AutomatorTaskStatus.Created
    })

    let automatorTask = await AutomatorTaskModel.findOne({
      magnetLink: task.magnetLink
    })

    if (!automatorTask) {
      automatorTask = await AutomatorTaskModel.create(doc)
    }

    return automatorTask
  }

}