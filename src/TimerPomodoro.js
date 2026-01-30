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
    // start pomodoro timer
    let sessionFormat = this._maxSession ? `Session ${currentSession} / ${this._maxSession}` : `Session ${currentSession} / 1`
    let self = this

    if (this._maxCountTime) {
      this.currentTimer.start()

      this._displayTicking(this.currentTimer, sessionFormat)

      this.currentTimer.finish(() => {
        this._writeToSingleLine(`Countdown Finished ✔︎`)
        currentSession = currentSession + 1

        notifier.notify({
          title: pkg.name,
          message: format(constants.MESSAGE.COUNTDOWN_TIME_FINISHED, this._maxCountTime),
          icon: path.join(__dirname, '../images/pomodoro.png'),
          sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForCountDown + '.mp3')) ? constants.soundFileForCountDown : 'Blow',
          notifyTimeout: constants.notifyTimeout,
          wait: true // not working
        },
        function () {
          self.currentTimer.stop()

          if (currentSession <= self._maxSession) {
            self._pomodoroTimer(currentSession)
          }

          if (self._maxBreakTime) {
            self._breakTimer(self.currentTimer)
          }
        }
        )
      })
    }
  }

  _breakTimer (currentTimer) {
    let self = this
    currentTimer = new Timr(format(constants.minuteStrFormat, this._maxBreakTime))
    currentTimer.start()

    this._displayTicking(currentTimer)

    currentTimer.finish(() => {
      this._writeToSingleLine(`Break Time Finished ✔︎`)

      notifier.notify({
        title: pkg.name,
        message: format(constants.MESSAGE.BREAK_TIME_FINISHED, this._maxBreakTime),
        icon: path.join(__dirname, `../images/break${this._getRandomNumber(1, 4)}.png`),
        sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForBreakTime + '.mp3')) ? constants.soundFileForBreakTime : 'Blow',
        notifyTimeout: constants.notifyTimeout,
        wait: true // not working
      }, function () {
        self.currentTimer.stop()
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
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
    process.stdout.write(text)
  }

  _getRandomNumber (min, max) {
    return Math.round(Math.random() * (max - min) + min)
  }
}

export default TimerPomodoro
