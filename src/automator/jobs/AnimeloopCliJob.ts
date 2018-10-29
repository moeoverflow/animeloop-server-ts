import path from 'path'
import mkdirp from 'mkdirp'
import Queue from 'bull'
import log4js from 'log4js'
import shell from 'shelljs'
import shellescape from 'shell-escape'
import bluebird from 'bluebird'
import { Container } from 'typedi'
import { ConfigService } from '../../core/services/ConfigService'
import { ChildProcess } from 'child_process'
import { readFileSync, existsSync } from 'fs'
import { AnimeloopTaskModel, AnimeloopTaskStatus } from '../../core/database/model/AnimeloopTask'

const logger = log4js.getLogger('Automator:Job:AnimeloopCliJob')
logger.level = 'debug'
export interface AnimeloopCliJobData {
  taskId: string
  rawFile: string
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
      [index: string]: string,
      jpg_1080p: string,
      mp4_1080p: string,
      mp4_720p?: string,
      mp4_360p?: string,
      jpg_720p?: string,
      jpg_360p?: string,
      gif_360p?: string
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

export async function AnimeloopCliJob(job: Queue.Job<AnimeloopCliJobData>) {
  const { taskId, rawFile, tempDir, outputDir } = job.data
  logger.info(`run animeloop-cli with ${path.basename(rawFile)}`)

  const animeloopTask = await AnimeloopTaskModel.findOneAndUpdate({
    _id: taskId
  }, {
    $set: {
      status: AnimeloopTaskStatus.Animelooping
    }
  }, {
    new: true
  })

  if (!animeloopTask) {
    throw new Error('animeloop_task_not_found')
  }

  const configService = Container.get(ConfigService)
  const { animeloopCli } = configService.config

  const args = [animeloopCli.bin, '-i', rawFile, '--cover', '-o', tempDir]
  const shellString = shellescape(args)

  logger.debug(`run command: ${shellString}`)

  const cli = shell.exec(shellString, { async: true, silent: true }) as ChildProcess
  const error = await bluebird.fromCallback(callback => cli.on('exit', callback))
  if (error) {
    throw new Error(`faied_to_run_command_animeloop-cli: ${error}`)
  }

  const basename = path.basename(rawFile, path.extname(rawFile))
  const tmpDir = path.join(tempDir, 'loops', basename)
  const targetDir = path.join(outputDir, basename)

  logger.debug(`move dir ${tmpDir} to ${targetDir}`)
  if (!existsSync(outputDir)) {
    mkdirp.sync(outputDir)
  }
  shell.mv(tmpDir, targetDir)

  const infoString = readFileSync(path.join(targetDir, `${basename}.json`)).toString()
  const info = JSON.parse(infoString) as IAnimeloopCliOutputInfo
  info.loops = info.loops.map(loop => {
    loop.files.jpg_1080p = path.join(targetDir, loop.files.jpg_1080p)
    loop.files.mp4_1080p = path.join(targetDir, loop.files.mp4_1080p)
    return loop
  })
  const output = {
    taskId,
    rawFile,
    info
  } as IAnimeloopCliOutput

  await animeloopTask.update({
    $set: {
      status: AnimeloopTaskStatus.Animelooped,
      output: output
    }
  })
  job.progress(100)
}
