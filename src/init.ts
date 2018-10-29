import 'reflect-metadata'
import mongoose from 'mongoose'
import { Container } from 'typedi'
import { ConfigService } from './core/services/ConfigService'

const configService = Container.get(ConfigService)

// connect mongodb
mongoose.set('useCreateIndex', true)
mongoose.set('useFindAndModify', false)
const { url } = configService.config.mongodb
mongoose.connect(url, { useNewUrlParser: true })
