require("../init")
import { EpisodeModel } from '../core/database/mongodb/models/Episode'
import { GroupModel } from '../core/database/mongodb/models/Group'
import { GroupLoopModel } from '../core/database/mongodb/models/GroupLoop'
import { LoopModel } from '../core/database/mongodb/models/Loop'
import { SeriesModel } from '../core/database/mongodb/models/Series'
import { Collection } from '../core/database/mysql/models/Collection'
import { CollectionLoop } from '../core/database/mysql/models/CollectionLoop'
import { Episode } from '../core/database/mysql/models/Episode'
import { Loop } from '../core/database/mysql/models/Loop'
import { Series, SeriesType } from '../core/database/mysql/models/Series'

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
      const type = (() => {
        if (!i.type) return null
        switch (i.type) {
          case 'TV':
            return SeriesType.TV
          case 'MOVIE':
            return SeriesType.Movie
          case 'TV_SHORT':
            return SeriesType.TV
          case 'SPECIAL':
            return SeriesType.Special
          case 'ONA':
            return SeriesType.ONA
          case 'OVA':
            return SeriesType.OVA
          default:
            return SeriesType.Other
        }
      })()
      const doc = {
        type: type,
        title: i.title || 'UNKNOWN',
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

  const oldLoops = await LoopModel.find({}, null, { $sort: { _id: 1 } })

  for (const i of oldLoops) {
    let loop = await Loop.findOne({
      where: {
        mongodbId: String(i._id),
      }
    })
    if (!loop) {
      const series = serieses.find((j) => j.mongodbId === String(i.series))
      const episode = episodes.find((j) => j.mongodbId === String(i.episode))
      if (!series || !episode) continue
      const files = i.files ? Object.assign({}, i.files) : null
      if (files) {
        const fileKeys = Object.keys(files)
        for (const fileKey of fileKeys) {
          files[fileKey] = files[fileKey].replace('https://s3.moeoverflow.com/animeloop-production', '')
        }
      }
      const doc = {
        uuid: i.newId,
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
      loop = await Loop.create(doc)
    }
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
