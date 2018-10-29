import { Service } from 'typedi'
import { AnimeloopTaskModel, AnimeloopTaskStatus } from '../../core/database/model/AnimeloopTask'
import { TransmissionService } from './TransmissionService'
import { IHorribleSubsItem } from './HorribleSubsService'
import { ITraceMoeItem } from './TraceMoeService'

@Service()
export class AnimeloopTaskService {
  constructor(
  ) {
  }

  public async findOrCreate(task: {
    rawFile: string
  }) {
    const { rawFile } = task

    let automatorTask = await AnimeloopTaskModel.findOne({
      rawFile
    })

    if (!automatorTask) {
      const doc = Object.assign(task, {
        status: AnimeloopTaskStatus.Created
      })
      automatorTask = await AnimeloopTaskModel.create(doc)
    }

    return automatorTask
  }

}