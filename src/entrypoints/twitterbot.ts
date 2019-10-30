import { Container } from 'typedi'
import TwitterBot from '../bot/TwitterBot'
import '../init'

const twitterBot = Container.get(TwitterBot)
twitterBot.run()
