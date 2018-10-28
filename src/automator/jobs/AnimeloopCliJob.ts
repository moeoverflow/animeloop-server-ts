import path from 'path'
import Queue from 'bull'
import log4js from 'log4js'
import shell from 'shelljs'
import shellescape from 'shell-escape'
import bluebird from 'bluebird'
import { Container } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import { AutomatorTaskModel, AutomatorTaskStatus } from '../../core/database/model/AutomatorTask'
import { ChildProcess } from 'child_process'
import { readFileSync } from 'fs'
import { Schema } from 'mongoose'

const logger = log4js.getLogger('Automator:Job:AnimeloopCliJob')

export interface AnimeloopCliJobData {
  taskId: string
  filename: string
  tempDir: string
  outputDir: string
}

export interface IAnimeloopCliOutputInfo {
  version: string
  title: string
  source: {
    filename: string
  }
  loops: {
    duration: number,
    files: {
      'jpg_1080p': string,
      'mp4_1080p': string
    },
    frame: {
      begin: string,
      end: string
    }
    period: {
      begin: string,
      end: string
    }
  }[]
}

export interface IAnimeloopCliOutput {
  taskId: string
  rawFile: string
  info: IAnimeloopCliOutputInfo
}

export async function AnimeloopCliJob(job: Queue.Job<any>) {
  const { taskId, filename, tempDir, outputDir } = job.data as AnimeloopCliJobData
  logger.info(`run animeloop-cli with ${path.basename(filename)}`)

  await AutomatorTaskModel.updateOne({ _id: taskId }, { $set: { status: AutomatorTaskStatus.Animelooping }})

  const configService = Container.get(ConfigService)
  const { animeloopCli } = configService.config

  const args = [animeloopCli.bin, '-i', filename, '--cover', '-o', tempDir]
  const shellString = shellescape(args)

  logger.debug(`run command: ${shellString}`)

  const cli = shell.exec(shellString, { async: true, silent: true }) as ChildProcess
  const error = await bluebird.fromCallback(callback => cli.on('exit', callback))
  if (error) {
    throw new Error(`faied_to_run_command_animeloop-cli: ${error}`)
  }

  const basename = path.basename(filename, path.extname(filename))
  const tmpDir = path.join(tempDir, 'loops', basename)
  const targetDir = path.join(outputDir, basename)

  logger.debug(`move dir ${tmpDir} to ${targetDir}`)
  shell.mv(tmpDir, targetDir)

  const infoString = readFileSync(path.join(targetDir, `${basename}.json`)).toString()
  const info = JSON.parse(infoString)
  const output = Object.assign(info, {
    taskId,
    rawFile: filename
  }) as IAnimeloopCliOutput

  console.log('await AutomatorTaskModel.updateOne({ _id: taskId }, {')
  await AutomatorTaskModel.updateOne({ _id: taskId }, {
    $set: {
      status: AutomatorTaskStatus.Animelooped
    },
    $push: {
      animeloopOutputs: output
    }
  })
}
