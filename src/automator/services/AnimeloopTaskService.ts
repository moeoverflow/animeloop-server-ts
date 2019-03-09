import { Service } from 'typedi'
import { AnimeloopTaskModel, AnimeloopTaskStatus } from '../../core/database/model/AnimeloopTask'
import { SeriesModel } from '../../core/database/model/Series'
import { EpisodeModel } from '../../core/database/model/Episode'
import { pick } from 'lodash'
import log4js from 'log4js'
import shell from 'shelljs'
import path from 'path'
import fs from 'fs'
import mkdirp from 'mkdirp'
import { LoopModel } from '../../core/database/model/Loop'
import { ConfigService } from '../../core/services/ConfigService'
import { pad } from '../utils/pad'

const logger = log4js.getLogger('Automator:Service:AnimeloopTask')
logger.level = 'debug'

@Service()
export class AnimeloopTaskService {
  constructor(
    private configService: ConfigService
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
      const start_date_fuzzy = anilistItem.startDate &&
      anilistItem.startDate.year && anilistItem.startDate.month && anilistItem.startDate.day
      ? `${anilistItem.startDate.year}${pad(anilistItem.startDate.month.toString(), 2)}${pad(anilistItem.startDate.day.toString(), 2)}` : undefined
      const end_date_fuzzy = anilistItem.endDate
      && anilistItem.endDate.year && anilistItem.endDate.month && anilistItem.endDate.day
      ? `${anilistItem.endDate.year}${pad(anilistItem.endDate.month.toString(), 2)}${pad(anilistItem.endDate.day.toString(), 2)}` : undefined

      await SeriesModel.updateOne({ id: series.id }, {
        title_romaji: anilistItem.title.romaji,
        title_english: anilistItem.title.english,
        title_japanese: anilistItem.title.native,
        description: anilistItem.description,
        start_date_fuzzy,
        end_date_fuzzy,
        type: anilistItem.format,
        genres: anilistItem.genres,
        adult: anilistItem.isAdult,
        image_url_large: anilistItem.coverImage.large,
        image_url_banner: anilistItem.bannerImage
      })
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
      for (const type in files) {
        shell.rm('-rf', path.dirname(files[type]))
      }
    }
  }
}