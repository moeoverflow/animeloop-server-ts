import '../init'
import { GroupModel } from '../core/database/model/Group'
import { GroupLoopModel } from '../core/database/model/GroupLoop'

async function uploadLoopsFromTelegramData() {
  const group = await GroupModel.findOne({
    id: 'telegram-channel-the-best-animeloop'
  })
  if (!group) throw new Error('group_not_found')

  const data = require('./data.json')
  const channel = data.chats.list.find((i: any) => i.id === 9898757349)!
  const loopIds = channel.messages.map((i: any) => {
    try {
      const text = i.text[0].text
      if (!text.startsWith('https://animeloop.org/loop')) return undefined
      const splited = text.split('/')
      const id = splited[splited.length - 1].slice(0, 24)
      return id
    } catch (error) {
      return undefined
    }
  }).filter((i: any) => i !== undefined)

  for (const loopId of loopIds) {
    await GroupLoopModel.findOrCreate({
      loop: loopId,
      group: group._id,
    })
  }
}

uploadLoopsFromTelegramData().then(() => {
  console.log('done.')
})
