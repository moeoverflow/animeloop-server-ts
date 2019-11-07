require("../init")
import { AnilistService } from '@jojo/anilist'
import { Container } from '@jojo/typedi'
import { chunk } from 'lodash'
import uuid from 'uuid'
import { EpisodeModel } from '../core/database/mongodb/models/Episode'
import { GroupModel } from '../core/database/mongodb/models/Group'
import { GroupLoopModel } from '../core/database/mongodb/models/GroupLoop'
import { LoopModel } from '../core/database/mongodb/models/Loop'
import { SeriesModel } from '../core/database/mongodb/models/Series'
import { Collection } from '../core/database/postgresql/models/Collection'
import { CollectionLoop } from '../core/database/postgresql/models/CollectionLoop'
import { Episode } from '../core/database/postgresql/models/Episode'
import { Loop } from '../core/database/postgresql/models/Loop'
import { Series } from '../core/database/postgresql/models/Series'

const anilistService = Container.get(AnilistService)

// tslint:disable-next-line: cyclomatic-complexity
async function migrateFromMongodb() {
  const oldSerieses = await SeriesModel.find({}, null, { $sort: { _id: 1 } })

  const serieses: Series[] = []
  for (const i of oldSerieses) {
    let series = await Series.findOne({
      where: {
        mongodbId: String(i._id),
      }
    })
    if (!series) {
      const type = anilistService.getSeriesType(i.type)
      const doc = {
        type: type,
        titleCHS: i.title || '未知',
        titleCHT: i.title || '未知',
        titleJA: i.title_japanese || i.title_english,
        titleROMAJI: i.title_romaji,
        titleEN: i.title_english,
        anilistId: i.anilist_id || null,
        anilistUpdatedAt: i.anilist_updated_at || null,
        mongodbId: String(i._id),
      }
      series = await Series.create(doc)
    }
    serieses.push(series)
  }

  const oldEpisodes = await EpisodeModel.find({}, null, { $sort: { _id: 1 } })
  const episodes: Episode[] = []
  for (const i of oldEpisodes) {
    let episode = await Episode.findOne({
      where: {
        mongodbId: String(i._id),
      }
    })
    if (!episode) {
      const series = serieses.find((j) => j.mongodbId === String(i.series))
      const doc = {
        index: i.no || 'UNKNOWN',
        seriesId: series.id,
        mongodbId: String(i._id),
      }
      episode = await Episode.create(doc)
    }
    episodes.push(episode)
  }


  const lastNewLoop = await Loop.findOne({
    order: [
      ['id', 'DESC'],
    ],
  })

  let oldLoops = await LoopModel.find({}, null, { $sort: { _id: 1 } })
  if (lastNewLoop) {
    const index = oldLoops.findIndex((i) => String(i._id) === lastNewLoop.mongodbId)
    if (index > -1) {
      oldLoops = oldLoops.slice(index+1)
    }
  }

  const chunks = chunk(oldLoops, 1000)

  for (const chunk of chunks) {
    const docs = chunk.map((i) => {
      const series = serieses.find((j) => j.mongodbId === String(i.series))
      const episode = episodes.find((j) => j.mongodbId === String(i.episode))
      if (!series || !episode) return null
      const files = i.files ? Object.assign({}, i.files) : null
      if (files) {
        const fileKeys = Object.keys(files)
        for (const fileKey of fileKeys) {
          files[fileKey] = files[fileKey].replace('https://s3.moeoverflow.com/animeloop-production', '')
        }
      }
      return {
        uuid: i.newId || uuid.v4(),
        duration: i.duration || null,
        periodBegin: i.period.begin,
        periodEnd: i.period.end,
        frameBegin: i.frame.begin,
        frameEnd: i.frame.end,
        source: i.sourceFrom,
        createdAt: i.uploadDate,
        seriesId: series ? series.id : null,
        episodeId: episode.id,
        files: files,
        mongodbId: String(i._id),
      }
    }).filter((i) => !!i)

    await Loop.bulkCreate(docs)
  }

  const oldGroups = await GroupModel.find({}, null, { $sort: { _id: 1 } })
  const collections = await Collection.bulkCreate(oldGroups.map((i) => {
    return {
      slug: i.id,
      name: i.name,
      description: i.description || null,
      cover: i.cover || null,
      mongodbId: String(i._id),
    }
  }))
  const oldGroupLoops = await GroupLoopModel.find({}, null, { $sort: { _id: 1 } })
  const filteredLoops = await Loop.findAll({
    where: {
      mongodbId: oldGroupLoops.map((i) => String(i.loop))
    }
  })
  await CollectionLoop.bulkCreate(oldGroupLoops.map((i) => {
    const collection = collections.find((j) => j.mongodbId === String(i.group))
    const loop = filteredLoops.find((j) => j.mongodbId === String(i.loop))

    return {
      collectionId: collection.id,
      loopId: loop.id,
    }
  }))
}

migrateFromMongodb().then(() => {
  console.log('done.')
}).catch((err) => {
  console.error(err)
})
