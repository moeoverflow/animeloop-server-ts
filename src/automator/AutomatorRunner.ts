import { HorribleSubsService } from '@jojo/horribleSubs'
import { TraceMoeService } from '@jojo/tracemoe'
import { TransmissionService } from '@jojo/transmission'
import { Service } from '@jojo/typedi'
import log4js from 'log4js'
import schedule from 'node-schedule'
import path from 'path'
import { AnimeloopTask, AnimeloopTaskStatus } from '../core/database/postgresql/models/AnimeloopTask'
import { AutomatorTask, AutomatorTaskStatus } from '../core/database/postgresql/models/AutomatorTask'
import { ConfigService } from '../core/services/ConfigService'
import { AnimeloopTaskService } from './services/AnimeloopTaskService'
import { BullService } from './services/BullService'

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
      [AnimeloopTask, AnimeloopTaskStatus.Animelooping, AnimeloopTaskStatus.Created],
      [AnimeloopTask, AnimeloopTaskStatus.InfoFetching, AnimeloopTaskStatus.Animelooped],
      [AnimeloopTask, AnimeloopTaskStatus.Converting, AnimeloopTaskStatus.InfoCompleted],
      [AnimeloopTask, AnimeloopTaskStatus.Adding, AnimeloopTaskStatus.Converted],
    ] as const

    await AnimeloopTask.transaction(null, async (transaction) => {
      for (const rollback of rollbackStatus) {
        const fromStatus = rollback[1]
        const toStatus = rollback[2]
        const docs = await AnimeloopTask.findAll({
          where: {
            status: fromStatus,
          },
          transaction,
        })
        for (const doc of docs) {
          await doc.transit(fromStatus, toStatus, null, transaction)
        }
      }
    })

    /**
     * fetch anime source from HorribleSubs every day,
     * and add to AutomatorTask
     */
    schedule.scheduleJob('0 * * * * *', async () => {
      logger.info('ScheduleJob:fetch_HorribleSubs')

      const items = await this.horribleSubsService.fetchRss()
      await AutomatorTask.transaction(null, async (transaction) => {
        for (const item of items) {
          const doc = {
            name: item.title,
            magnetLink: item.link
          }
          await AutomatorTask.findOrCreate({
            where: doc,
            defaults: doc,
            transaction,
          })
        }
      })
    })

    /**
     * check new task every minute,
     * add magnet link to transmission for downloading,
     * update AutomatorTask status to Downloading
     */
    schedule.scheduleJob('1 * * * * *', async () => {
      logger.info('ScheduleJob:add_url_to_transmission')

      await AutomatorTask.transaction(null, async (transaction) => {
        const automatorTasks = await AutomatorTask.findAll({
          where: {
            status: AutomatorTaskStatus.Created,
          },
          transaction,
        })
        for (const automatorTask of automatorTasks) {
          logger.info(`add url to transmission: ${automatorTask.name}`)

          const task = await this.transmissionService.addUrl(automatorTask.magnetLink)
          await automatorTask.transit(
            AutomatorTaskStatus.Created,
            AutomatorTaskStatus.Downloading,
            async (automatorTask, transaction) => {
              await automatorTask.update({
                transmissionId: task.id,
              }, { transaction })
            },
            transaction,
          )
        }
      })
    })

    /**
     * check complete(seeding) tasks every minute,
     * update AutomatorTask status to Downloaded
     */
    schedule.scheduleJob('2 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_downloaded')

      const videoExtRegex = new RegExp(`.*\.(mp4|mkv)$`)

      const seedingTasks = await this.transmissionService.findSeedingTasks()
      await AutomatorTask.transaction(null, async (transaction) => {
        const automatorTasks = await AutomatorTask.findAll({
          where: {
            status: AutomatorTaskStatus.Downloading,
            transmissionId: seedingTasks.map((task) => task.id),
          },
          transaction
        })

        for (const automatorTask of automatorTasks) {
          const transmissionTask = seedingTasks.find((task) => task.id === automatorTask.transmissionId)
          const { downloadDir } = transmissionTask

          const files = transmissionTask.files
          .map((file: any) => path.join(downloadDir, file.name))
          .filter((file: string) => videoExtRegex.test(file))

          logger.info(`update task status downloaded: ${automatorTask.name}`)
          await automatorTask.transit(
            AutomatorTaskStatus.Downloading,
            AutomatorTaskStatus.Downloaded,
            async (automatorTask, transaction) => {
              await automatorTask.update({
                files
              }, { transaction })
            },
            transaction,
          )
        }
      })
    })

    /**
     * check downloaded task every minute,
     * add animeloop-cli jobs
     */
    schedule.scheduleJob('3 * * * * *', async () => {
      logger.info('ScheduleJob:add_animeloop_cli_jobs')

      const storage = this.configService.config.storage


      await AutomatorTask.transaction(null, async (transaction) => {
        const automatorTasks = await AutomatorTask.findAll({
          where: {
            status: AutomatorTaskStatus.Downloaded,
          },
          transaction,
        })

        for (const automatorTask of automatorTasks) {

          for (const file of automatorTask.files) {
            logger.info(`add animeloop cli jobs: ${file}`)

            const doc = {
              file,
              automatorTaskId: automatorTask.id,
            }
            await AnimeloopTask.findOrCreate({
              where: doc,
              defaults: doc,
              transaction,
            })
          }

          await automatorTask.transit(
            AutomatorTaskStatus.Downloaded,
            AutomatorTaskStatus.Animelooping,
            null,
            transaction,
          )
        }

        const animeloopTasks = await AnimeloopTask.findAll({
          where: {
            status: AnimeloopTaskStatus.Created,
          },
          transaction,
        })
        for (const animeloopTask of animeloopTasks) {
          await animeloopTask.transit(
            AnimeloopTaskStatus.Created,
            AnimeloopTaskStatus.Animelooping,
            async (animeloopTask) => {
              await this.bullService.addAnimeloopCliJob({
                taskId: animeloopTask.id,
                rawFile: animeloopTask.file,
                tempDir: storage.dir.autogen,
                outputDir: storage.dir.upload
              })
            },
            transaction,
          )
        }
      })
    })


    /**
     * check task which animelooped,
     * fetch info from trace.moe
     */
    schedule.scheduleJob('5 * * * * *', async () => {
      logger.info('ScheduleJob:fetch_info')

      await AnimeloopTask.transaction(null, async (transaction) => {
        const animeloopTasks = await AnimeloopTask.findAll({
          where: {
            status: AnimeloopTaskStatus.Animelooped,
          },
          transaction,
        })
        for (const animeloopTask of animeloopTasks) {
          await animeloopTask.transit(
            AnimeloopTaskStatus.Animelooped,
            AnimeloopTaskStatus.InfoFetching,
            async (animeloopTask) => {
              await this.bullService.addFetchInfoJob({
                taskId: animeloopTask.id
              })
            },
            transaction,
          )
        }
      })
    })


    /**
     * convert file
     */
    schedule.scheduleJob('7 * * * * *', async () => {
      logger.info('ScheduleJob:convert_file')
      const animeloopTasks = await AnimeloopTask.findAll({
        where: {
          status: AnimeloopTaskStatus.InfoCompleted,
        },
      })
      for (const animeloopTask of animeloopTasks) {
        await this.bullService.addConvertJob({
          taskId: animeloopTask.id,
        })
        await animeloopTask.transit(
          AnimeloopTaskStatus.InfoCompleted,
          AnimeloopTaskStatus.Converting,
        )
      }
    })

    /**
     * check if all video files animelooped in one task
     */
    schedule.scheduleJob('8 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_converted')

      const automatorTasks = await AutomatorTask.findAll({
        where: {
          status: AutomatorTaskStatus.Animelooping
        },
        include: [AnimeloopTask],
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = automatorTask.animeloopTasks
        const successTasks = animeloopTasks.filter((task) => task.status === AnimeloopTaskStatus.Converted)
        if (animeloopTasks.length === successTasks.length) {
          await automatorTask.transit(
            AutomatorTaskStatus.Animelooping,
            AutomatorTaskStatus.Animelooped,
          )
        }
      }
    })

    /**
     * add data to library
     */
    schedule.scheduleJob('9 * * * * *', async () => {
      logger.info('ScheduleJob:add_data_to_library')

      const automatorTasks = await AutomatorTask.findAll({
        where: {
          status: AutomatorTaskStatus.Animelooped
        },
        include: [AnimeloopTask],
      })

      for (const automatorTask of automatorTasks) {
        const animeloopTasks = automatorTask.animeloopTasks

        await AutomatorTask.transaction(null, async (transaction) => {
          await automatorTask.transit(
            AutomatorTaskStatus.Animelooped,
            AutomatorTaskStatus.Adding,
            null,
            transaction,
          )
          for (const animeloopTask of animeloopTasks) {
            await animeloopTask.transit(
              AnimeloopTaskStatus.Converted,
              AnimeloopTaskStatus.Adding,
              null,
              transaction,
            )
            await this.animeloopTaskService.addDataToLibrary(animeloopTask.id, transaction)
          }
        })
      }
    })

    /**
     * update task status done
     */
    schedule.scheduleJob('10 * * * * *', async () => {
      logger.info('ScheduleJob:update_task_status_converted')

      await AutomatorTask.transaction(null, async (transaction) => {
        const automatorTasks = await AutomatorTask.findAll({
          where: {
            status: AutomatorTaskStatus.Adding,
          },
          include: [AnimeloopTask],
        })

        for (const automatorTask of automatorTasks) {
          const animeloopTasks = automatorTask.animeloopTasks
          const successTasks = animeloopTasks.filter((task) => task.status === AnimeloopTaskStatus.Done)
          if (animeloopTasks.length === successTasks.length) {
            await automatorTask.transit(
              AutomatorTaskStatus.Adding,
              AutomatorTaskStatus.Done,
              async (automatorTask) => {
                await this.transmissionService.remove([automatorTask.transmissionId], true)
              },
              transaction,
            )
          }
        }
      })
    })
  }
}
