import { AnilistService } from 'jojo-anilist'
import { Inject, Service } from 'jojo-base'
import { MinioService } from 'jojo-minio'
import { Transaction } from 'jojo-sequelize'
import log4js from 'log4js'
import { DateTime } from 'luxon'
import path from 'path'
import request from 'request-promise-native'
import shell from 'shelljs'
import uuid from 'uuid'
import { AnimeloopTask, AnimeloopTaskStatus } from '../../core/database/postgresql/models/AnimeloopTask'
import { Episode } from '../../core/database/postgresql/models/Episode'
import { Loop, LoopSource } from '../../core/database/postgresql/models/Loop'
import { Series } from '../../core/database/postgresql/models/Series'
import { MinioS3Service } from '../../core/services/MinioS3Service'


const logger = log4js.getLogger('Automator:Service:AnimeloopTask')
logger.level = 'debug'

@Service()
export class AnimeloopTaskService {

  @Inject(() => MinioService) minioService: MinioService
  @Inject(() => AnilistService) anilistService: AnilistService
  @Inject(() => MinioS3Service) minioS3Service: MinioS3Service

  constructor(
  ) {
  }

  async addDataToLibrary(taskId: string, transaction?: Transaction) {
    const animeloopTask = await AnimeloopTask.findByPk(taskId, { transaction })

    await AnimeloopTask.transaction(transaction, async (transaction) => {
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

      const newSeriesInfo = this.anilistService.getNewSeriesInfo(animeloopTask.anilistItem)

      if (newSeriesInfo.cover && (!series.cover || !series.cover.startsWith('anilist'))) {
        try {
          const extname = path.extname(newSeriesInfo.cover)
          const buffer = await request({
            url: newSeriesInfo.cover,
            encoding: null
          })
          const objectName = `anilist/${series.anilistId}/cover${extname}`
          await this.minioS3Service.uploadFile(objectName, buffer)
          newSeriesInfo.cover = objectName
        } catch (error) {
          newSeriesInfo.cover = series.cover
        }
      } else {
        newSeriesInfo.cover = series.cover
      }
      if (newSeriesInfo.banner && (!series.banner || !series.banner.startsWith('anilist'))) {
        try {
          const extname = path.extname(newSeriesInfo.banner)
          const buffer = await request({
            url: newSeriesInfo.banner,
            encoding: null
          })
          const objectName = `anilist/${series.anilistId}/banner${extname}`
          await this.minioS3Service.uploadFile(objectName, buffer)
          newSeriesInfo.banner = objectName
        } catch (error) {
          newSeriesInfo.banner = series.banner
        }
      } else {
        newSeriesInfo.banner = series.banner
      }
      if (!newSeriesInfo.titleCHT) {
        newSeriesInfo.titleCHT = series.titleCHT
      }

      await series.update(newSeriesInfo, { transaction })

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
        if (!_loop.uuid) _loop.uuid = uuid.v4()
        const _files = _loop.files
        const files: any = {}
        for (const type of Object.keys(_files)) {
          const [ext] = type.split('_')
          const filepath = _files[type]
          const dateString = DateTime.fromJSDate(uploadDate).toFormat('yyyy-MM-dd')
          const objectName = `loops/${dateString}/${type}/${_loop.uuid}.${ext}`
          await this.minioService.minio.fPutObject('animeloop-production', objectName, filepath, {})
          files[type] = objectName
        }

        await Loop.create({
          uuid: _loop.uuid,
          duration: _loop.duration,
          periodBegin: _loop.period.begin,
          periodEnd: _loop.period.end,
          frameBegin: _loop.frame.begin,
          frameEnd: _loop.frame.end,
          source: LoopSource.Automator,
          seriesId: series.id,
          episodeId: episode.id,
          files,
        }, { transaction })
      }

      await animeloopTask.transit(
        AnimeloopTaskStatus.Adding,
        AnimeloopTaskStatus.Done,
        null,
        transaction,
      )

      for (const _loop of _loops) {
        const files = _loop.files
        for (const url of Object.values(files)) {
          shell.rm('-rf', path.dirname(url))
        }
      }
    })
  }
}