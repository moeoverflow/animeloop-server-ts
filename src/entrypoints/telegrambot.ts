import { Container } from 'typedi'
import TelegramBot from '../bot/TelegramBot'
import '../init'

const telegramBot = Container.get(TelegramBot)
telegramBot.run()
