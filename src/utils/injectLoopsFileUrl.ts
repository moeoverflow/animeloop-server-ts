import Container from 'typedi'
import { Loop } from '../core/database/mysql/models/Loop'
import { MinioS3Service } from '../core/services/MinioS3Service'

export function injectLoopsFileUrl(loops: Loop[]) {
  return loops.map((i) => {
    for (const key of Object.keys(i.files)) {
      i.files[key] = Container.get(MinioS3Service).getPublicUrl(i.files[key])
    }
    return i.toJSON()
  })
}