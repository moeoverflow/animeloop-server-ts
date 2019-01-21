import Queue from 'bull'
import log4js from 'log4js'
import bluebird from 'bluebird'
import { readFileSync } from 'fs'
import { AnimeloopTaskModel, AnimeloopTaskStatus } from '../../core/database/model/AnimeloopTask'
import { hmsToSeconds } from '../utils/hmsToSeconds'
import { ITraceMoeDoc, TraceMoeService } from '../services/TraceMoeService'
import { AnilistService, IAnilistItem } from '../services/AnilistService'
import { Container } from 'typedi'
import { pad } from '../utils/pad'

const logger = log4js.getLogger('Automator:Job:FetchInfoJob')

export interface FetchInfoJobData {
  taskId: string
}

export interface IFetchInfoOutput {
}

export async function FetchInfoJob(job: Queue.Job<FetchInfoJobData>) {
  const traceMoeService = Container.get(TraceMoeService)
  const anilistService = Container.get(AnilistService)

  const { taskId } = job.data

  const animeloopTask = await AnimeloopTaskModel.findById(taskId)

  if (!animeloopTask.output) {
    throw new Error('animeloop_task_output_not_found')
  }

  const { loops } = animeloopTask.output.info

  const flag = loops.length < 10
  const randomLoops = loops.filter((loop) => {
    if (flag) {
      return flag
    }
    const begin = hmsToSeconds(loop.period.begin)
    return (begin > (3 * 60))
  }).slice(0).sort(() => 0.5 - Math.random()).slice(0, 5)

  const results: (ITraceMoeDoc)[] = []
  try {
    for (const loop of randomLoops) {
      const file = readFileSync(loop.files.jpg_1080p)
      const result = await traceMoeService.searchImage(file)

      /**
       * trace.moe search api ratelimit
       * wait 10s for every search request
       */
      await bluebird.fromCallback((callback: any) => setTimeout(callback, 10000))

      results.push(result.docs.sort((prev, next) => prev.similarity - next.similarity)[0])
    }
  } catch (error) {
    logger.warn('fetch trace.moe data failed.')
    await animeloopTask.update({
      $set: {
        status: AnimeloopTaskStatus.InfoWait
      }
    })
  }

  const counts: any = {}
  results.forEach((result) => {
    const id = result.anilist_id
    // this line will convert {number} type id to {string} type key
    counts[id] = counts[id] ? counts[id] + 1 : 1
  })

  const len = randomLoops.length
  const mid = Math.round(len / 2) + (len % 2 === 0 ? 1 : 0)
  let result
  for (const key in counts) {
    if (counts[key] >= mid) {
      result = results.filter(result => (result.anilist_id.toString() === key))[0]
      break
    }
  }

  if (!result) {
    logger.warn('tracemoe has no matched info.')
    await animeloopTask.update({
      $set: {
        status: AnimeloopTaskStatus.InfoWait
      }
    })
    return
  }

  const { seriesTitle, episodeNo, anilistId } = parseResult(result)

  job.progress(70)

  let anilistItem: IAnilistItem = undefined
  try {
    if (!anilistId) {
      throw new Error('anilistId_not_found')
    }
    anilistItem = await anilistService.getInfo(anilistId)
  } catch (error) {
    logger.warn('fetch anilist data failed.')
    await animeloopTask.update({
      $set: {
        status: AnimeloopTaskStatus.InfoWait
      }
    })
  }

  await animeloopTask.update({
    $set: {
      status: AnimeloopTaskStatus.InfoCompleted,
      seriesTitle,
      episodeNo,
      anilistId,
      anilistItem
    }
  })

  job.progress(100)
}

function parseResult(doc: ITraceMoeDoc) {
  const seriesTitle = doc.anime
  let episodeNo = ''
  if (doc.episode === '' || doc.episode === 'OVA/OAD') {
    episodeNo = 'OVA'
  } else {
    episodeNo = `${pad(doc.episode, 2)}`
  }
  const anilistId = doc.anilist_id

  return {
    seriesTitle,
    episodeNo,
    anilistId
  }
}
