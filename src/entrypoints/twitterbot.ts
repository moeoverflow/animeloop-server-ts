require("../init")
import { Container } from 'jojo-typedi'
import TwitterBot from '../bot/TwitterBot'

const twitterBot = Container.get(TwitterBot)
twitterBot.run()
