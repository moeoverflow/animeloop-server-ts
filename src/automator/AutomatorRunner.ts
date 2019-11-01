import { TraceMoeService } from '@jojo/tracemoe'
import log4js from 'log4js'
import schedule from 'node-schedule'
import path from 'path'
import { Service } from 'typedi'
import { AnimeloopTaskModel, AnimeloopTaskStatus } from '../core/database/mongodb/models/AnimeloopTask'
import { AutomatorTaskModel, AutomatorTaskStatus } from '../core/database/mongodb/models/AutomatorTask'
import { ConfigService } from '../core/services/ConfigService'
import { AnimeloopTaskService } from './services/AnimeloopTaskService'
import { BullService } from './services/BullService'
import { HorribleSubsService } from './services/HorribleSubsService'
import { TransmissionService } from './services/TransmissionService'


const logger = log4js.getLogger('Automator:main')
logger.level = 'debug'

@Service()
export default class AutomatorRunner {
  constructor(
    protected animeloopTaskService: AnimeloopTaskService,
    protected transmissionService: TransmissionService,
    protected bullService: BullService,
    protected horribleSubsService: HorribleSubsService,
    protected traceMoeService: TraceMoeService,
    private configService: ConfigService
  ) {
  }

  public async run() {

    /**
     * rollback task doing status before run
     */
    const rollbackStatus = [
      // AnimeloopTask
      [AnimeloopTaskModel, AnimeloopTaskStatus.Animelooping, AnimeloopTaskStatus.Created],
      [AnimeloopTaskModel, AnimeloopTaskStatus.InfoFetching, AnimeloopTaskStatus.Animelooped],
      [AnimeloopTaskModel, AnimeloopTaskStatus.Converting, AnimeloopTaskStatus.InfoCompleted],
      [AnimeloopTaskModel, AnimeloopTaskStatus.Adding, AnimeloopTaskStatus.Converted],
      // AutomatorTask
      [AutomatorTaskModel, AutomatorTaskStatus.Animelooping, AutomatorTaskStatus.Downloaded],
      [AutomatorTaskModel, AutomatorTaskStatus.InfoFetching, AutomatorTaskStatus.Animelooped],
      [AutomatorTaskModel, AutomatorTaskStatus.Converting, AutomatorTaskStatus.InfoCompleted],
      [AutomatorTaskModel, AutomatorTaskStatus.Adding, AutomatorTaskStatus.Converted]
    ]
    for (const rollback of rollbackStatus) {
      const Model = rollback[0] as typeof AnimeloopTaskModel | typeof AutomatorTaskModel
      await Model.updateMany({
        status: rollback[1]
      }, {
        $set: {
          status: rollback[2]
        }
      })
    }

    /**
     * fetch anime source from HorribleSubs every day,
     * and add to AutomatorTask
     */
    schedule.scheduleJob('0 * * * * *', async () => {
      logger.info('ScheduleJob:fetch_HorribleSubs')

      const items = await this.horribleSubsService.fetchRss()
      for (const item of items) {
        await AutomatorTaskModel.findOrCreate({
          name: item.title,
          magnetLink: item.link
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

        const task = await this.transmissionService.addUrl(automatorTask.magnetLink)
        await automatorTask.update({
          $set: {
            status: AutomatorTaskStatus.Downloading,
            transmissionId: task.id
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
      const automatorTasks = await AutomatorTaskModel.find({
        transmissionId: {
          $in: seedingTasks.map((task) => task.id)
        },
        status: AutomatorTaskStatus.Downloading
      })
      for (const automatorTask of automatorTasks) {
        const transmissionTask = seedingTasks.find((task) => task.id === automatorTask.transmissionId)
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
    schedule.scheduleJob('3 * * * * *', async () => {
      logger.info('ScheduleJob:add_animeloop_cli_jobs')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Downloaded
      })

      const storage = this.configService.config.storage

      for (const automatorTask of automatorTasks) {
        await automatorTask.update({ $set: { status: AutomatorTaskStatus.Animelooping }})

        for (const rawFile of automatorTask.rawFiles) {
          logger.info(`add animeloop cli jobs: ${rawFile}`)

          const { doc } = await AnimeloopTaskModel.findOrCreate({
            rawFile,
            automatorTask: automatorTask._id
          })

          const animeloopTask = doc

          await this.bullService.addAnimeloopCliJob({
            taskId: animeloopTask._id,
            rawFile,
            tempDir: storage.dir.autogen,
            outputDir: storage.dir.upload
          })
        }
      }
    })

    /**
     * check if all video files animelooped in one task
     */
    schedule.scheduleJob('4 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_animelooped')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Animelooping
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = await AnimeloopTaskModel.find({
          automatorTask: automatorTask._id
        })
        const successTasks = animeloopTasks.filter((task) => task.status === AnimeloopTaskStatus.Animelooped)
        if (animeloopTasks.length > 0 && animeloopTasks.length === successTasks.length) {
          await automatorTask.update({
            $set: {
              status: AutomatorTaskStatus.Animelooped
            }
          })
          await this.transmissionService.remove([automatorTask.transmissionId], true)
        }
      }
    })


    /**
     * check task which animelooped,
     * fetch info from trace.moe
     */
    schedule.scheduleJob('5 * * * * *', async () => {
      logger.info('ScheduleJob:fetch_info_from_trace.moe')
      const automatorTasks  = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Animelooped
      })


      for (const automatorTask of automatorTasks) {
        const animeloopTasks = await AnimeloopTaskModel.find({
          automatorTask: automatorTask._id,
          status: AnimeloopTaskStatus.Animelooped
        })
        await automatorTask.update({ $set: { status: AutomatorTaskStatus.InfoFetching }})
        for (const animeloopTask of animeloopTasks) {
          await animeloopTask.update({ $set: { status: AnimeloopTaskStatus.InfoFetching }})
          await this.bullService.addFetchInfoJob({
            taskId: animeloopTask._id
          })
        }
      }
    })


    /**
     * update task status InfoCompleted
     */
    schedule.scheduleJob('6 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_infocomplete')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.InfoFetching
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = await AnimeloopTaskModel.find({
          automatorTask: automatorTask._id
        })
        const successTasks = animeloopTasks.filter((task) => task.status === AnimeloopTaskStatus.InfoCompleted)
        if (animeloopTasks.length > 0 && animeloopTasks.length === successTasks.length) {
          await automatorTask.update({
            $set: {
              status: AutomatorTaskStatus.InfoCompleted
            }
          })
        }
      }
    })


    /**
     * convert file
     */
    schedule.scheduleJob('7 * * * * *', async () => {
      logger.info('ScheduleJob:convert_file')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.InfoCompleted
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = await AnimeloopTaskModel.find({
          automatorTask: automatorTask._id,
          status: AutomatorTaskStatus.InfoCompleted
        })
        await automatorTask.update({ $set: { status: AutomatorTaskStatus.Converting }})
        for (const animeloopTask of animeloopTasks) {
          await this.bullService.addConvertJob({
            taskId: animeloopTask._id
          })
        }
      }
    })

    /**
     * update task status converted
     */
    schedule.scheduleJob('8 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_converted')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Converting
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = await AnimeloopTaskModel.find({
          automatorTask: automatorTask._id
        })
        const successTasks = animeloopTasks.filter((task) => task.status === AnimeloopTaskStatus.Converted)
        if (animeloopTasks.length > 0 && animeloopTasks.length === successTasks.length) {
          await automatorTask.update({
            $set: {
              status: AutomatorTaskStatus.Converted
            }
          })
        }
      }
    })

    /**
     * add data to library
     */
    schedule.scheduleJob('9 * * * * *', async () => {
      logger.info('ScheduleJob:add_data_to_library')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Converted
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = await AnimeloopTaskModel.find({
          automatorTask: automatorTask._id,
          status: AnimeloopTaskStatus.Converted
        })

        await automatorTask.update({ $set: { status: AutomatorTaskStatus.Adding }})
        for (const animeloopTask of animeloopTasks) {
          await this.animeloopTaskService.addDataToLibrary(animeloopTask._id)
        }
      }
    })

    /**
     * update task status done
     */
    schedule.scheduleJob('10 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_converted')

      const automatorTasks = await AutomatorTaskModel.find({
        status: AutomatorTaskStatus.Adding
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = await AnimeloopTaskModel.find({
          automatorTask: automatorTask._id
        })
        const successTasks = animeloopTasks.filter((task) => task.status === AnimeloopTaskStatus.Done)
        if (animeloopTasks.length > 0 && animeloopTasks.length === successTasks.length) {
          await automatorTask.update({
            $set: {
              status: AutomatorTaskStatus.Done
            }
          })
        }
      }
    })
  }
}
