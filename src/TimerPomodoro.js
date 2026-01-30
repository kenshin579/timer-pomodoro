import constants from './constants'

import path from 'path'
import fs from 'fs'
import os from 'os'

import Timr from 'timrjs'
import notifier from 'node-notifier'
import updateNotifier from 'update-notifier'
import format from 'string-template'
import pkg from '../package.json'
import FileUtils from './FileUtils'

// const getStorePath = () => path.join(require('os').homedir(), '.pomodoro_timer.json')
// const localStorage = require('piggy-bank')(getStorePath())
const pkgUpdateNotifier = updateNotifier({ pkg })

// notify updates
pkgUpdateNotifier.notify()

class TimerPomodoro {
  constructor (userConfig = {}) {
    this._maxCountTime = userConfig.maxCountTime
    this._maxSession = userConfig.maxSession
    this._maxBreakTime = userConfig.maxBreakTime
    this._maxLongTermBreakTime = userConfig.maxLongTermBreakTime
    this.currentTimer = new Timr(format(constants.minuteStrFormat, this._maxCountTime))
    FileUtils.copyFilesInSrcDirToDstDir('./sound', constants.userHomeLibrarySoundPath)
  }

  run () {
    let currentSession = 1

    this._pomodoroTimer(currentSession)

    return {
      killRunningTimer: () => {
        this.currentTimer.stop()
      }
    }
  }

  _pomodoroTimer (currentSession) {
    let sessionFormat = this._maxSession
      ? `Session ${currentSession} / ${this._maxSession}`
      : `Session ${currentSession} / 1`
    let self = this

    if (this._maxCountTime) {
      this.currentTimer = new Timr(format(constants.minuteStrFormat, this._maxCountTime))
      this.currentTimer.start()
      this._displayTicking(this.currentTimer, sessionFormat)

      this.currentTimer.finish(() => {
        this._writeToSingleLine('Countdown Finished ✔︎\n')
        currentSession = currentSession + 1

        notifier.notify({
          title: pkg.name,
          message: format(constants.MESSAGE.COUNTDOWN_TIME_FINISHED, this._maxCountTime),
          icon: path.join(__dirname, '../images/pomodoro.png'),
          sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForCountDown + '.mp3')) ? constants.soundFileForCountDown : 'Blow',
          notifyTimeout: constants.notifyTimeout,
          wait: true
        },
        function () {
          self.currentTimer.stop()

          if (self._maxBreakTime) {
            self._breakTimer(currentSession)
          } else if (currentSession <= (self._maxSession || 1)) {
            self._pomodoroTimer(currentSession)
          }
        })
      })
    }
  }

  _breakTimer (currentSession) {
    let self = this
    let isLongBreak = this._maxLongTermBreakTime && this._maxSession && currentSession > this._maxSession
    let breakTime = isLongBreak ? this._maxLongTermBreakTime : this._maxBreakTime
    let breakMessage = isLongBreak
      ? format(constants.MESSAGE.EXCEEDED_MAX_SESSION, this._maxSession, this._maxLongTermBreakTime)
      : format(constants.MESSAGE.BREAK_TIME_FINISHED, this._maxBreakTime)

    this.currentTimer = new Timr(format(constants.minuteStrFormat, breakTime))
    this.currentTimer.start()
    this._displayTicking(this.currentTimer)

    this.currentTimer.finish(() => {
      this._writeToSingleLine('Break Time Finished ✔︎\n')

      notifier.notify({
        title: pkg.name,
        message: breakMessage,
        icon: path.join(__dirname, `../images/break${this._getRandomNumber(1, 4)}.png`),
        sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForBreakTime + '.mp3')) ? constants.soundFileForBreakTime : 'Blow',
        notifyTimeout: constants.notifyTimeout,
        wait: true
      }, function () {
        self.currentTimer.stop()
        if (isLongBreak) {
          currentSession = 1
        }
        if (self._maxCountTime) {
          self._pomodoroTimer(currentSession)
        }
      })
    })
  }

  _displayTicking (currentTimer, sessionFormat) {
    currentTimer.ticker(({ formattedTime, raw, percentDone }) => {
      if (sessionFormat) {
        this._writeToSingleLine(`🕐 ${formattedTime} [${percentDone}%] - ${sessionFormat}`)
      } else {
        this._writeToSingleLine(`🕐 ${formattedTime} [${percentDone}%]`)
      }
    })
  }

  _writeToSingleLine (text) {
    if (process.stdout.isTTY) {
      process.stdout.clearLine()
      process.stdout.cursorTo(0)
    }
    process.stdout.write(text)
  }

  _getRandomNumber (min, max) {
    return Math.round(Math.random() * (max - min) + min)
  }
}

export default TimerPomodoro
