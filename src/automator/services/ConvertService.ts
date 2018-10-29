import log4js from 'log4js'
import shell from 'shelljs'
import bluebird from 'bluebird'
import { Service } from 'typedi'
import { dirname, basename, extname, join } from 'path'

const logger = log4js.getLogger('Automator:Service:ConvertService')
logger.level = 'debug'

export enum MediaSize {
  S360P = '360p',
  S720P = '720p',
  S1080P = '1080p'
}

export enum MediaType {
  MP4_1080P = 'mp4_1080p',
  MP4_720P = 'mp4_720p',
  MP4_360P = 'mp4_360p',
  WEBM_1080P = 'webm_1080p',
  WEBM_360P = 'webm_360p',
  GIF_360P = 'gif_360p',
  JPG_1080P = 'jpg_1080p',
  JPG_720P = 'jpg_720p',
  JPG_360P = 'jpg_360p'

}

@Service()
export class ConvertService {

  constructor (
  ) {
  }

  async convert(src: string, dst: string, from: MediaType, to: MediaType) {
    const srcExtname = extname(src)

    const srcFilename = basename(src, srcExtname)
    const srcDir = dirname(src)

    const tmpfile = join(srcDir, `${srcFilename}.tmp${srcExtname}`)
    const palette = join(srcDir, `${srcFilename}.palette.png`)

    await bluebird.fromCallback(callback => {
      if (from === MediaType.MP4_1080P && to === MediaType.MP4_360P) {
        shell.exec(`ffmpeg -y -loglevel panic -i "${src}" -vf scale=-1:360 "${tmpfile}"`, callback)
      } else if (from === MediaType.MP4_1080P && to === MediaType.MP4_720P) {
        shell.exec(`ffmpeg -y -loglevel panic -i "${src}" -vf scale=-1:720 "${tmpfile}"`, callback)
      } else if (from === MediaType.MP4_1080P && to === MediaType.GIF_360P) {
        shell.exec(`ffmpeg -y -loglevel panic -y -i "${src}" -vf "fps=10,scale='if(gte(iw,ih),320,-1)':'if(gt(ih,iw),320,-1)':flags=lanczos,palettegen" "${palette}";
          ffmpeg -y -loglevel panic -i "${src}" -i "${palette}" -filter_complex "fps=10,scale='if(gte(iw,ih),320,-1)':'if(gt(ih,iw),320,-1)':flags=lanczos[x];[x][1:v]paletteuse" "${tmpfile}"
          rm "${palette}"
          `, callback)
      } else if (from === MediaType.MP4_1080P && to === MediaType.WEBM_1080P) {
        shell.exec(`ffmpeg -y -loglevel panic -i "${src}" -c:v libvpx -an -b 512K "${tmpfile}"`, callback)
      } else if (from === MediaType.MP4_1080P && to === MediaType.WEBM_360P) {
        shell.exec(`ffmpeg -y -loglevel panic -i "${src}" -vf scale=-1:360 -c:v libvpx -an -b 512K "${tmpfile}"`, callback)
      } else if (from === MediaType.JPG_1080P && to === MediaType.JPG_720P) {
        shell.exec(`convert -quiet -resize 720 "${src}" "${tmpfile}"`, callback)
      } else if (from === MediaType.JPG_1080P && to === MediaType.JPG_360P) {
        shell.exec(`convert -quiet -resize 360 "${src}" "${tmpfile}"`, callback)
      } else {
        callback(new Error('convert_type_mismatch'))
      }
    })

    shell.mv(tmpfile, dst)
  }
}
