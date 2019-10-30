import { DateTime } from 'luxon'
import path from 'path'
import { Container } from 'typedi'
import uuid from 'uuid'
import { LoopModel } from '../core/database/mongodb/models/Loop'
import { ConfigService } from '../core/services/ConfigService'
import { MinioService } from '../core/services/MinioService'
import '../init'

const minioService = Container.get(MinioService)
const configService = Container.get(ConfigService)

async function uploadMinio() {
  const loops = await LoopModel.find({
    $or: [
      { newId: null },
      { files: null },
    ],
  }, null, { limit: 3 })
  const len = loops.length
  for (let [index, loop] of loops.entries()) {
    console.log(`uploading ${index + 1}/${len}`)
    const data = [
      ['mp4_1080p', 'mp4'],
      ['mp4_720p', 'mp4'],
      ['mp4_360p', 'mp4'],
      ['gif_360p', 'gif'],
      ['jpg_720p', 'jpg'],
      ['jpg_360p', 'jpg'],
    ]
    const id = uuid.v4()
    for (const [type, ext] of data) {
      if (loop.files && loop.files[type]) continue
      const filepath = path.join(configService.config.storage.dir.data, type, `${loop._id}.${ext}`)
      const dateString = DateTime.fromJSDate(loop.uploadDate).toFormat('yyyy-MM-dd')
      const objectName = `loops/${dateString}/${type}/${id}.${ext}`
      try {
        await minioService.minio.fPutObject('animeloop-production', objectName, filepath, {})
        const fileUrl = `https://s3.moeoverflow.com/animeloop-production/${objectName}`
        await LoopModel.update({ _id: loop._id }, {
          $set: {
            files: {
              ...(loop.files || {}),
              [type]: fileUrl,
            },
          }
        })
        loop = await LoopModel.findById(loop._id)
      } catch (error) {
        console.error(error)
      }
    }
    await loop.update({
      $set: {
        newId: id,
      }
    })
  }
}

uploadMinio().then(() => {
  console.log('done.')
}).catch(() => {})
