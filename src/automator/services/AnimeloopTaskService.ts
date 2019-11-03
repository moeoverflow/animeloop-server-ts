import log4js from 'log4js'
import { DateTime } from 'luxon'
import path from 'path'
import shell from 'shelljs'
import { Inject, Service } from 'typedi'
import uuid from 'uuid'
import { MinioService } from '../../@jojo/minio'
import { AnimeloopTask, AnimeloopTaskStatus } from '../../core/database/mysql/models/AnimeloopTask'
import { Episode } from '../../core/database/mysql/models/Episode'
import { Loop } from '../../core/database/mysql/models/Loop'
import { Series } from '../../core/database/mysql/models/Series'

const logger = log4js.getLogger('Automator:Service:AnimeloopTask')
logger.level = 'debug'

@Service()
export class AnimeloopTaskService {

  @Inject(() => MinioService) minioService: MinioService

  constructor(
  ) {
  }

  async addDataToLibrary(taskId: string) {
    const animeloopTask = await AnimeloopTask.findByPk(taskId)

    await AnimeloopTask.transaction(null, async (transaction) => {
      const [series] = await Series.findOrCreate({
        where: {
          anilistId: animeloopTask.anilistId
        },
        defaults: {
          title: animeloopTask.seriesTitle,
          anilistId: animeloopTask.anilistId,
        },
        transaction,
      })

      const [episode] = await Episode.findOrCreate({
        where: {
          index: animeloopTask.episodeIndex,
          seriesId: series.id,
        },
        defaults: {
          index: animeloopTask.episodeIndex,
          seriesId: series.id,
        },
        transaction,
      })

      const { loops: _loops } = animeloopTask.output.info
      for (const _loop of _loops) {
        const uploadDate = new Date()
        const _uuid = uuid.v4()

        const _files = _loop.files
        const files: any = {}
        for (const type of Object.keys(_files)) {
          const [ext] = type.split('_')
          const filepath = _files[type]
          const dateString = DateTime.fromJSDate(uploadDate).toFormat('yyyy-MM-dd')
          const objectName = `loops/${dateString}/${type}/${_uuid}.${ext}`
          await this.minioService.minio.fPutObject('animeloop-production', objectName, filepath, {})
          files[type] = objectName
        }

        await Loop.create({
          duration: _loop.duration,
          periodBegin: _loop.period.begin,
          periodEnd: _loop.period.end,
          frameBegin: _loop.frame.begin,
          frameEnd: _loop.frame.end,
          sourceFrom: 'automator',
          uploadDate: new Date(),
          series: series.id,
          episode: episode.id,
          files,
        }, { transaction })
      }

      await animeloopTask.transit(
        AnimeloopTaskStatus.Converted,
        AnimeloopTaskStatus.Done,
        async () => {
          for (const _loop of _loops) {
            const files = _loop.files
            for (const url of Object.values(files)) {
              shell.rm('-rf', path.dirname(url))
            }
          }
        },
        transaction,
      )
    })
  }
}