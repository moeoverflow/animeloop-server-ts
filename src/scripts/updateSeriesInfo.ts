require("../init")
import { AnilistService } from 'jojo-anilist'
import { Op } from 'jojo-sequelize'
import { Container } from 'jojo-base'
import { delay } from 'bluebird'
import path from 'path'
import request from 'request-promise-native'
import { Series } from '../core/database/postgresql/models/Series'
import { MinioS3Service } from '../core/services/MinioS3Service'

const anilistService = Container.get(AnilistService)
const minioS3Service = Container.get(MinioS3Service)

async function updateSeriesInfo() {
  const seriesList = await Series.findAll({
    where: {
      anilistId: {
        [Op.not]: null,
      },
    },
  })
  for (const series of seriesList) {
    const anilistItem = await anilistService.getInfo(series.anilistId)
    const newSeriesInfo = anilistService.getNewSeriesInfo(anilistItem)
    if (newSeriesInfo.cover && !newSeriesInfo.cover.startsWith('/anilist')) {
      const extname = path.extname(newSeriesInfo.cover)
      const buffer = await request({
        url: newSeriesInfo.cover,
        encoding: null
      })
      const objectName = `anilist/${series.anilistId}/cover${extname}`
      await minioS3Service.uploadFile(objectName, buffer)
      newSeriesInfo.cover = objectName
    }
    if (newSeriesInfo.banner && !newSeriesInfo.banner.startsWith('/anilist')) {
      const extname = path.extname(newSeriesInfo.banner)
      try {
        const buffer = await request({
          url: newSeriesInfo.banner,
          encoding: null
        })
        const objectName = `anilist/${series.anilistId}/banner${extname}`
        await minioS3Service.uploadFile(objectName, buffer)
        newSeriesInfo.banner = objectName
      } catch (error) {
      }
    }
    await series.update(newSeriesInfo)
    await delay(1000)
    console.log(`updated ${series.titleCHS || series.titleJA || series.titleEN}`)
  }
}



updateSeriesInfo().then(() => {
  console.log('done.')
}).catch((err) => {
  console.error(err)
})