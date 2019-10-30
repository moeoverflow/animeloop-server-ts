import fs from 'fs'
import { pick } from 'lodash'
import log4js from 'log4js'
import mkdirp from 'mkdirp'
import path from 'path'
import shell from 'shelljs'
import { Service } from 'typedi'
import { AnimeloopTaskModel, AnimeloopTaskStatus } from '../../core/database/mongodb/models/AnimeloopTask'
import { EpisodeModel } from '../../core/database/mongodb/models/Episode'
import { LoopModel } from '../../core/database/mongodb/models/Loop'
import { SeriesModel } from '../../core/database/mongodb/models/Series'
import { ConfigService } from '../../core/services/ConfigService'
import { SeriesService } from './SeriesService'

const logger = log4js.getLogger('Automator:Service:AnimeloopTask')
logger.level = 'debug'

@Service()
export class AnimeloopTaskService {
  constructor(
    private configService: ConfigService,
    private seriesService: SeriesService
  ) {
  }

  async addDataToLibrary(taskId: string) {
    const animeloopTask = await AnimeloopTaskModel.findById(taskId)

    const series = (await SeriesModel.findOrCreate({
      title: animeloopTask.seriesTitle,
      anilist_id: animeloopTask.anilistId
    })).doc

    const { anilistItem } = animeloopTask

    if (anilistItem) {
      await this.seriesService.updateInfoFromAnilistItem(series._id, anilistItem)
    }

    const episode = (await EpisodeModel.findOrCreate({
      no: animeloopTask.episodeNo,
      series: series._id
    })).doc

    const { loops } = animeloopTask.output.info
    const dataDir = this.configService.config.storage.dir.data
    for (const _loop of loops) {
      const loop = await LoopModel.create({
        ...pick(_loop, ['duration', 'period', 'frame']),
        sourceFrom: 'automator',
        uploadDate: new Date(),
        series: series._id,
        episode: episode._id
      })

      const files = _loop.files
      for (const type in files) {
        if (files[type]) {
          const extname = path.extname(files[type])
          const cpDir = path.join(dataDir, type)
          if (!fs.existsSync(cpDir)) {
            mkdirp.sync(cpDir)
          }
          shell.cp(files[type], path.join(cpDir, `${loop._id}${extname}`))
        }
      }
    }

    await animeloopTask.update({ $set: { status: AnimeloopTaskStatus.Done }})

    for (const _loop of loops) {
      const files = _loop.files
      for (const url of Object.values(files)) {
        shell.rm('-rf', path.dirname(url))
      }
    }
  }
}