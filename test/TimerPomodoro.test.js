import constants from '../src/constants'
import FileUtils from '../src/FileUtils'
import TimerPomodoro from '../src/TimerPomodoro'

describe('TimerPomodoro', () => {
  describe('_getRandomNumber', () => {
    it('should return a number between min and max', () => {
      const tp = new TimerPomodoro({ maxCountTime: 1 })
      for (let i = 0; i < 100; i++) {
        const num = tp._getRandomNumber(1, 4)
        expect(num).toBeGreaterThanOrEqual(1)
        expect(num).toBeLessThanOrEqual(4)
      }
    })
  })

  describe('constructor', () => {
    it('should use userConfig values', () => {
      const config = { maxCountTime: 30, maxBreakTime: 10, maxSession: 5, maxLongTermBreakTime: 20 }
      const tp = new TimerPomodoro(config)
      expect(tp._maxCountTime).toBe(30)
      expect(tp._maxBreakTime).toBe(10)
      expect(tp._maxSession).toBe(5)
      expect(tp._maxLongTermBreakTime).toBe(20)
    })
  })

  describe('FileUtils', () => {
    it('should copy sound files without error', () => {
      FileUtils.copyFilesInSrcDirToDstDir('./sound', constants.userHomeLibrarySoundPath)
    })
  })
})
