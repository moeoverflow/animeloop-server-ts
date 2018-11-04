const download = require('image-downloader')

export async function imageDownloader(url: string, to: string) {
  return await download.image({
    url,
    dest: to
  })
}