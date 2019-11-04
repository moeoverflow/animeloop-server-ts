import Queue from 'bull'
import { existsSync } from 'fs'
import path, { basename, extname } from 'path'
import { Container } from 'typedi'
import { AnimeloopTask, AnimeloopTaskStatus } from '../../core/database/postgresql/models/AnimeloopTask'
import { ConvertService, MediaType } from '../services/ConvertService'

export interface ConvertJobData {
  taskId: string
}

export async function ConvertJob(job: Queue.Job<ConvertJobData>) {
  const convertService = Container.get(ConvertService)

  const { taskId } = job.data
  const animeloopTask = await AnimeloopTask.findByPk(taskId)
  const output = Object.assign({}, animeloopTask.output)
  const { loops } = output.info
  for (const loop of loops) {
    const { mp4_1080p, jpg_1080p } = loop.files

    const dirname = path.dirname(mp4_1080p)

    const mp4_720p = path.join(dirname, `${basename(mp4_1080p, extname(mp4_1080p))}_convert_720p.mp4`)
    const mp4_360p = path.join(dirname, `${basename(mp4_1080p, extname(mp4_1080p))}_convert_360p.mp4`)
    const gif_360p = path.join(dirname, `${basename(mp4_1080p, extname(mp4_1080p))}_convert_360p.gif`)
    const jpg_720p = path.join(dirname, `${basename(jpg_1080p, extname(jpg_1080p))}_convert_720p.jpg`)
    const jpg_360p = path.join(dirname, `${basename(jpg_1080p, extname(jpg_1080p))}_convert_360p.jpg`)

    if (!existsSync(mp4_720p)) {
      await convertService.convert(mp4_1080p, mp4_720p, MediaType.MP4_1080P, MediaType.MP4_720P)
    }

    if (!existsSync(mp4_360p)) {
      await convertService.convert(mp4_1080p, mp4_360p, MediaType.MP4_1080P, MediaType.MP4_360P)
    }

    if (!existsSync(gif_360p)) {
      await convertService.convert(mp4_1080p, gif_360p, MediaType.MP4_1080P, MediaType.GIF_360P)
    }

    if (!existsSync(jpg_720p)) {
      await convertService.convert(jpg_1080p, jpg_720p, MediaType.JPG_1080P, MediaType.JPG_720P)
    }

    if (!existsSync(jpg_360p)) {
      await convertService.convert(jpg_1080p, jpg_360p, MediaType.JPG_1080P, MediaType.JPG_360P)
    }

    loop.files = {
      mp4_1080p,
      mp4_720p,
      mp4_360p,
      gif_360p,
      jpg_1080p,
      jpg_720p,
      jpg_360p
    }
  }

  await animeloopTask.transit(
    AnimeloopTaskStatus.Converting,
    AnimeloopTaskStatus.Converted,
    async (animeloopTask, transaction) => {
      await animeloopTask.update({
        output,
      }, { transaction })
    }
  )

  await job.progress(100)
}
