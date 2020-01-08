require("../init")
import { Container } from 'jojo-base'
import TwitterBot from '../bot/TwitterBot'

const twitterBot = Container.get(TwitterBot)
twitterBot.run()
