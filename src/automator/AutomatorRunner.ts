import schedule from 'node-schedule'
import log4js from 'log4js'
import path from 'path'

import { Service } from 'typedi'
import { AutomatorTaskService } from './services/AutomatorTaskService'

import { HorribleSubsService } from './services/HorribleSubsService'
import { TransmissionService } from './services/TransmissionService'
import { AutomatorTaskModel, AutomatorTaskStatus } from '../core/database/model/AutomatorTask'

const logger = log4js.getLogger('Automator:main')
logger.level = 'debug'

@Service()
export default class AutomatorRunner {
  constructor(
    protected automatorTaskService: AutomatorTaskService,
    protected horribleSubsService: HorribleSubsService,
    protected transmissionService: TransmissionService
  ) {
  }

  public async run() {
    /**
     * fetch anime source from HorribleSubs every day,
     * and add to AutomatorTask
     */
    schedule.scheduleJob('0 * * * * *', async () => {
      logger.info('fetch anime source from HorribleSubs')
      const items = await this.horribleSubsService.fetchRss()
      for (const item of items) {
        await this.automatorTaskService.findOrCreate({
          name: item.title,
          magnetLink: item.link,
          horribleSubsItem: item
        })
      }
    })

    /**
     * check new task every minute,
     * add magnet link to transmission for downloading,
     * update AutomatorTask status to Downloading
     */
    schedule.scheduleJob('0 * * * * *', async () => {
      logger.info('add download task to Transmission')
      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Created
      })
      for (const automatorTask of automatorTasks) {
        await this.transmissionService.addUrl(automatorTask.magnetLink)
        await automatorTask.update({
          $set: {
            status: AutomatorTaskStatus.Downloading
          }
        })
      }
    })

    /**
     * check complete(seeding) tasks every minute,
     * update AutomatorTask status to Downloaded
     */
    schedule.scheduleJob('0 * * * * *', async () => {
      logger.info('update task status from Transmission')
      const stoppedTasks = await this.transmissionService.findSeedingTasks()
      const transmissionTasks = stoppedTasks.filter(task => task.name.includes('[HorribleSubs]'))
      const automatorTasks = await AutomatorTaskModel.find({
        name: {
          $in: transmissionTasks.map(task => task.name)
        },
        status: AutomatorTaskStatus.Downloading
      })
      for (const automatorTask of automatorTasks) {
        const transmissionTask = transmissionTasks.find(task => task.name === automatorTask.name)
        const { downloadDir } = transmissionTask
        const files = transmissionTask.files.map((file: any) => path.join(downloadDir, file.name))
        await automatorTask.update({
          $set: {
            status: AutomatorTaskStatus.Downloaded,
            files
          }
        })
      }
    })
  }
}
