import '../init'
import { Container } from 'typedi'
import TwitterBot from '../bot/TwitterBot'

const twitterBot = Container.get(TwitterBot)
twitterBot.run()
