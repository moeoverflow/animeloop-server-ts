import bluebird from 'bluebird'
import Queue from 'bull'
import { readFileSync } from 'fs'
import { AnilistService, IAnilistItem } from 'jojo-anilist'
import { Container } from 'jojo-base'
import { ITraceMoeDoc, TraceMoeService } from 'jojo-tracemoe'
import { maxBy, padStart, sortBy } from 'lodash'
import log4js from 'log4js'
import uuid from 'uuid'
import { AnimeloopTask, AnimeloopTaskStatus } from '../../core/database/postgresql/models/AnimeloopTask'
import { hmsToSeconds } from '../utils/hmsToSeconds'

const logger = log4js.getLogger('Automator:Job:FetchInfoJob')

export interface FetchInfoJobData {
  taskId: string
}

export interface IFetchInfoOutput {
}

export async function FetchInfoJob(job: Queue.Job<FetchInfoJobData>) {
  const anilistService = Container.get(AnilistService)

  const { taskId } = job.data

  const animeloopTask = await AnimeloopTask.findByPk(taskId)

  animeloopTask.output.info.loops = animeloopTask.output.info.loops.map((i) => {
    if (!i.uuid) i.uuid = uuid.v4()
    return i
  })
  await animeloopTask.save()
  await animeloopTask.update({
    output: animeloopTask.output,
  })

  if (!animeloopTask.anilistId || !animeloopTask.episodeIndex) {
    try {
      await getTraceMoeResult(animeloopTask)
    } catch (error) {
      logger.error(error)
      await animeloopTask.transit(
        AnimeloopTaskStatus.InfoFetching,
        AnimeloopTaskStatus.InfoWait,
      )
      return
    }
  }

  await job.progress(70)

  const { seriesTitle, anilistId, episodeIndex } = animeloopTask

  let anilistItem: IAnilistItem
  try {
    if (!anilistId) {
      throw new Error('anilistId_not_found')
    }
    anilistItem = await anilistService.getInfo(anilistId)
  } catch (error) {
    logger.warn('fetch anilist data failed.')
    await animeloopTask.transit(
      AnimeloopTaskStatus.InfoFetching,
      AnimeloopTaskStatus.InfoWait,
    )
  }

  await animeloopTask.transit(
    AnimeloopTaskStatus.InfoFetching,
    AnimeloopTaskStatus.InfoCompleted,
    async (animeloopTask, transaction) => {
      await animeloopTask.update({
        seriesTitle,
        episodeIndex,
        anilistId,
        anilistItem
      }, { transaction })
    },
  )

  await job.progress(100)
}

async function getTraceMoeResult(animeloopTask: AnimeloopTask) {
  const traceMoeService = Container.get(TraceMoeService)

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

  for (const loop of randomLoops) {
    const file = readFileSync(loop.files.jpg_1080p)
    const result = await traceMoeService.searchImage(file)

    /**
     * trace.moe search api ratelimit
     * wait 10s for every search request
     */
    await bluebird.fromCallback((callback: any) => setTimeout(callback, 10000))

    const doc = maxBy(result.docs, (i) => i.similarity)
    if (doc) {
      results.push(doc)
    }
  }

  const counts: any = {}
  results.forEach((result) => {
    const id = result.anilist_id
    // this line will convert {number} type id to {string} type key
    counts[id] = counts[id] ? counts[id] + 1 : 1
  })
  const countsArr = sortBy(Object.entries(counts), (i) => i[1]).reverse()
  let result: ITraceMoeDoc
  if (countsArr.length === 1) {
    result = results.find((i) => String(i.anilist_id) === countsArr[0][0])
  } else if (countsArr.length > 1 && countsArr[0] && countsArr[1] && countsArr[0][1] > countsArr[1][1]) {
    result = results.find((i) => String(i.anilist_id) === countsArr[0][0])
  } else {
    throw new Error('tracemoe has no matched info.')
  }

  await animeloopTask.update({
    ...parseResult(result),
  })
}

function parseResult(doc: ITraceMoeDoc) {
  const seriesTitle = doc.anime
  let episodeIndex = ''
  if (doc.episode === '' || doc.episode === 'OVA/OAD') {
    episodeIndex = 'OVA'
  } else {
    episodeIndex = `${padStart(doc.episode, 2, '0')}`
  }
  const anilistId = doc.anilist_id

  return {
    seriesTitle,
    episodeIndex,
    anilistId
  }
}
