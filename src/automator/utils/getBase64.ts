import sharp from 'sharp'

export async function getBase64(file: Buffer) {
  return (await sharp(file)
    .resize(960)
    .toBuffer()).toString('base64')
}
