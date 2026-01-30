import os from 'os'
import path from 'path'

function getSoundPath () {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Sounds')
  }
  return path.join(os.homedir(), '.local', 'share', 'sounds')
}

const constants = {
  programName: 'timer-pomodoro',
  minuteStrFormat: '{0}:00',
  maxCountTime: 25, // mins
  maxBreakTime: 5, // mins
  maxLongTermBreakTime: 15, // mins (15~30)
  maxSession: 4,
  notifyTimeout: 30,
  soundFileForCountDown: 'Clock-chimes',
  soundFileForBreakTime: 'Bell-sound-effect-ding',
  userHomeLibrarySoundPath: getSoundPath(),
  MESSAGE: {
    COUNTDOWN_TIME_FINISHED: '{0}분동안 집중해서 작업하셨어요 ~~',
    BREAK_TIME_FINISHED: '{0}분동안 쉬셨어요~~',
    EXCEEDED_COUNTDOWN_SESSION: '작업하기전에 {0}분동아 쉬세요!!',
    EXCEEDED_BREAK_SESSION: '쉬기보다는 더 집중해서 작업을 할 때입니다!!',
    EXCEEDED_MAX_SESSION: '총{0}번 이상 집중해서 작업했습니다. 조금 더 길게 쉴시간({1}분)입니다.'
  }
}
export default constants
