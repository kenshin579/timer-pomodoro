#! /usr/bin/env node
'use strict'

import commander from 'commander'
import TimerPomodoro from './TimerPomodoro'
import constants from './constants'

var program = commander
  .version(require('../package.json').version)
  .name(constants.programName)
  .option('-t, --time [n]', `the number of mins for countdown (default: ${constants.maxCountTime})`, parseInt)
  .option('-b, --break [n]', `the number of mins for break time (default: ${constants.maxBreakTime})`, parseInt)
  .option('-l, --long [n]', `the number of mins for long-term break (default: ${constants.maxLongTermBreakTime})`, parseInt)
  .option('-s, --session [n]', `the max number of sessions for long-term break (default: ${constants.maxSession})`, parseInt)
  // .option('-d, --dtype <dtype>', 'select display type (big, small) for time format', /^(big|small)$/i, constants.timeDisplayType)
  .on('--help', function () {
    console.log('')
    console.log('Examples:')
    console.log(`  $ ${constants.programName} -h : show help usage`)
    console.log(`  $ ${constants.programName} -t : start 25 mins countdown timer`)
    console.log(`  $ ${constants.programName} -t 30 : start 30 mins countdown timer`)
    console.log(`  $ ${constants.programName} -t -b : start countdown and break timer with default value`)
    console.log(`  $ ${constants.programName} -t 25 -b 10 : start 25 mins countdown timer and take 10 mins break`)
    console.log(`  $ ${constants.programName} -t 25 -b 10 -s 5: start 25 mins countdown timer and take 10 mins break (repeats 5 times)`)
  })
  .parse(process.argv)

const userConfig = {}
if (process.argv.length <= 2) {
  program.outputHelp()
  process.exit()
}

createUserConfig()

const timerPomodoro = new TimerPomodoro(userConfig).run()

process.on('SIGINT', () => {
  console.log('\nSIGINT signal received.')
  console.log('Terminating timer.')
  timerPomodoro.killRunningTimer()
  process.exit(0)
})

function createUserConfig () {
  if (commander.time) {
    if (Number.isInteger(commander.time)) {
      userConfig.maxCountTime = commander.time
    } else {
      userConfig.maxCountTime = constants.maxCountTime
    }
  }

  if (commander.break) {
    if (Number.isInteger(commander.break)) {
      userConfig.maxBreakTime = commander.break
    } else {
      userConfig.maxBreakTime = constants.maxBreakTime
    }
  }

  if (commander.long) {
    if (Number.isInteger(commander.long)) {
      userConfig.maxLongTermBreakTime = commander.long
    } else {
      userConfig.maxLongTermBreakTime = constants.maxLongTermBreakTime
    }
  }

  if (commander.session) {
    if (Number.isInteger(commander.session)) {
      userConfig.maxSession = commander.session
    } else {
      userConfig.maxSession = constants.maxSession
    }
  }
  // userConfig.timeDisplayType = commander.dtype || constants.dtype
}
