import schedule from 'node-schedule'
import log4js from 'log4js'
import path from 'path'

import { Service } from 'typedi'
import { AutomatorTaskService } from './services/AutomatorTaskService'

import { HorribleSubsService } from './services/HorribleSubsService'
import { TransmissionService } from './services/TransmissionService'
import { AutomatorTaskModel, AutomatorTaskStatus } from '../core/database/model/AutomatorTask'
import { TraceMoeService } from './services/TraceMoeService'
import { BullService } from './services/BullService'
import { ConfigService } from '../core/services/ConfigService'

const logger = log4js.getLogger('Automator:main')
logger.level = 'debug'

@Service()
export default class AutomatorRunner {
  constructor(
    protected automatorTaskService: AutomatorTaskService,
    protected transmissionService: TransmissionService,
    protected bullService: BullService,
    protected horribleSubsService: HorribleSubsService,
    protected traceMoeService: TraceMoeService,
    private configService: ConfigService
  ) {
  }

  public async run() {
    /**
     * fetch anime source from HorribleSubs every day,
     * and add to AutomatorTask
     */
    schedule.scheduleJob('0 * * * * *', async () => {
      logger.info('ScheduleJob:fetch_HorribleSubs')

      const items = await this.horribleSubsService.fetchRss(4)
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
    schedule.scheduleJob('1 * * * * *', async () => {
      logger.info('ScheduleJob:add_url_to_transmission')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Created
      })
      for (const automatorTask of automatorTasks) {
        logger.info(`add url to transmission: ${automatorTask.name}`)

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
    schedule.scheduleJob('2 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_downloaded')

      const videoExtRegex = new RegExp(`.*\.(mp4|mkv)$`)

      const seedingTasks = await this.transmissionService.findSeedingTasks()
      const horribleSubsTasks = seedingTasks.filter(task => task.name.includes('[HorribleSubs]'))
      const automatorTasks = await AutomatorTaskModel.find({
        name: {
          $in: horribleSubsTasks.map(task => task.name)
        },
        status: AutomatorTaskStatus.Downloading
      })
      for (const automatorTask of automatorTasks) {
        const transmissionTask = horribleSubsTasks.find(task => task.name === automatorTask.name)
        const { downloadDir } = transmissionTask

        const rawFiles = transmissionTask.files
        .map((file: any) => path.join(downloadDir, file.name))
        .filter((file: string) => videoExtRegex.test(file))

        logger.info(`update task status downloaded: ${automatorTask.name}`)
        await automatorTask.update({
          $set: {
            status: AutomatorTaskStatus.Downloaded,
            rawFiles
          }
        })
      }
    })

    /**
     * check downloaded task every minute,
     * add animeloop-cli jobs
     */
    // schedule.scheduleJob('3 * * * * *', async () => {
      logger.info('ScheduleJob:add_animeloop_cli_jobs')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Downloaded
      })

      const storage = this.configService.config.storage

      for (const automatorTask of automatorTasks) {
        for (const rawFile of automatorTask.rawFiles) {
          logger.info(`add animeloop cli jobs: ${rawFile}`)
          await this.bullService.addAnimeloopCliJob({
            taskId: automatorTask.id,
            filename: rawFile,
            tempDir: storage.dir.autogen,
            outputDir: storage.dir.upload
          })
        }
      }
    // })

    /**
     * check if all video files animelooped in one task
     */
    schedule.scheduleJob('4 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_animelooped')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Animelooping
      })

      for (const automatorTask of automatorTasks) {
        const { rawFiles, animeloopOutputs } = automatorTask
        if (!rawFiles) continue
        if (!animeloopOutputs) continue
        if (rawFiles.length === animeloopOutputs.length) {
          await automatorTask.update({
            $set: {
              status: AutomatorTaskStatus.Animelooped
            }
          })
        }
      }
    })

    /**
     * check downloaded task every minute,
     * fetch anime info from trace.moe
     */
    // schedule.scheduleJob('0 * * * * *', async () => {
    //   logger.info('fetch anime info from trace.moe')
    //   const automatorTasks = await AutomatorTaskModel.find({
    //     status: AutomatorTaskStatus.Downloaded
    //   })
    //   for (const automatorTask of automatorTasks) {
    //     await automatorTask.update({ $set: { status: AutomatorTaskStatus.FetchingInfo } })
    //     this.traceMoeService.
    //   }
    // })
  }
}
