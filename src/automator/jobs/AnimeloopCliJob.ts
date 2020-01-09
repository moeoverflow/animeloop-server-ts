import bluebird from 'bluebird'
import Queue from 'bull'
import { ChildProcess } from 'child_process'
import { existsSync, readFileSync } from 'fs'
import { Container } from 'jojo-base'
import log4js from 'log4js'
import mkdirp from 'mkdirp'
import path from 'path'
import shellescape from 'shell-escape'
import shell from 'shelljs'
import { AnimeloopTask, AnimeloopTaskStatus } from '../../core/database/postgresql/models/AnimeloopTask'
import { ConfigService } from '../../core/services/ConfigService'

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
    uuid?: string
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

  const animeloopTask = await AnimeloopTask.findOne({
    where: {
      id: taskId,
    }
  })

  if (!animeloopTask) {
    throw new Error('animeloop_task_not_found')
  }

  const configService = Container.get(ConfigService)
  const animeloopCli = configService.getConfig("animeloopCli")

  let shellString: string = ''
  if (animeloopCli.bin.includes('docker run')) {
    const ext = path.extname(rawFile)
    const basename = path.basename(rawFile, ext)
    const args = [
      'docker run',
      '-v', `\'${tempDir}:/data\'`,
      '-v', `\'${rawFile}:/${basename}${ext}\'`,
      '--rm',
      'animeloop-cli',
      '--cover',
      '-i', `\'/${basename}${ext}\'`,
      '-o', '/data',
    ]
    shellString = args.join(' ')
  } else {
    const args = [animeloopCli.bin, '-i', rawFile, '--cover', '-o', tempDir]
    shellString = shellescape(args)
  }

  logger.debug(`run command: ${shellString}`)

  const cli = shell.exec(shellString, { async: true, silent: true }) as ChildProcess
  const error = await bluebird.fromCallback((callback) => cli.on('exit', callback))
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

  if (info.loops) {
    info.loops = info.loops.map((loop) => {
      loop.files.jpg_1080p = path.join(targetDir, loop.files.jpg_1080p)
      loop.files.mp4_1080p = path.join(targetDir, loop.files.mp4_1080p)
      return loop
    })
  }

  const output = {
    taskId,
    rawFile,
    info
  } as IAnimeloopCliOutput

  await animeloopTask.transit(
    AnimeloopTaskStatus.Animelooping,
    AnimeloopTaskStatus.Animelooped,
    async (animeloopTask, transaction) => {
      await animeloopTask.update({
        output,
      }, { transaction })
  })

  await job.progress(100)
}
