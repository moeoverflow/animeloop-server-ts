import '../init'
import { Container } from 'typedi'
import TwitterBot from '../bot/twitterbot'

const twitterBot = Container.get(TwitterBot)
twitterBot.run()
