require("../init")
import { Container } from 'jojo-base'
import TelegramBot from '../bot/TelegramBot'

const telegramBot = Container.get(TelegramBot)
telegramBot.run()
