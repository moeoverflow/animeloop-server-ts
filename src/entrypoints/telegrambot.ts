import '../init'
import { Container } from 'typedi'
import TelegramBot from '../bot/TelegramBot'

const telegramBot = Container.get(TelegramBot)
telegramBot.run()
