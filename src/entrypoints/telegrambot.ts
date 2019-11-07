require("../init")
import { Container } from '@jojo/typedi'
import TelegramBot from '../bot/TelegramBot'

const telegramBot = Container.get(TelegramBot)
telegramBot.run()
