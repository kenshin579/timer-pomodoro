# 버그 수정 및 안정화 — 구현 문서

## 수정 대상 파일

| 파일 | 변경 내용 |
|------|-----------|
| `src/TimerPomodoro.js` | 버그 수정 (1.1~1.4), 로직 수정 (2.1~2.2), TTY 체크 (3.1) |
| `src/constants.js` | 플랫폼별 사운드 경로 (3.1) |
| `package.json` | 미사용 의존성 제거 (4.1), Mocha→Jest 전환 (4.2) |
| `test/TimerPomodoro.test.js` | Jest로 테스트 재작성 (4.2) |

---

## 1. `src/TimerPomodoro.js` 변경사항

### 1.1 constructor 수정

```js
// 중복 _maxSession 제거, _maxLongTermBreakTime 추가
constructor (userConfig = {}) {
  this._maxCountTime = userConfig.maxCountTime
  this._maxSession = userConfig.maxSession
  this._maxBreakTime = userConfig.maxBreakTime
  this._maxLongTermBreakTime = userConfig.maxLongTermBreakTime  // 변경
  this.currentTimer = new Timr(format(constants.minuteStrFormat, this._maxCountTime))
  FileUtils.copyFilesInSrcDirToDstDir('./sound', constants.userHomeLibrarySoundPath)
}
```

### 1.2 `fs.existsSync` 수정 (2곳)

countdown 알림 (61행):
```js
sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForCountDown + '.mp3'))
  ? constants.soundFileForCountDown : 'Blow',
```

break 알림 (95행):
```js
sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForBreakTime + '.mp3'))
  ? constants.soundFileForBreakTime : 'Blow',
```

### 1.3 `_getRandomNumber` 호출 수정

```js
icon: path.join(__dirname, `../images/break${this._getRandomNumber(1, 4)}.png`),
```

### 1.4 `_pomodoroTimer` 흐름 수정 — 순차 실행

notification 콜백에서 break → 완료 후 다음 세션 순서로 변경한다.
`_breakTimer`에 콜백 파라미터를 추가하여 break 완료 시 다음 세션을 시작한다.

```js
_pomodoroTimer (currentSession) {
  let sessionFormat = this._maxSession
    ? `Session ${currentSession} / ${this._maxSession}`
    : `Session ${currentSession} / 1`
  let self = this

  if (this._maxCountTime) {
    this.currentTimer.start()
    this._displayTicking(this.currentTimer, sessionFormat)

    this.currentTimer.finish(() => {
      this._writeToSingleLine('Countdown Finished ✔︎\n')
      currentSession = currentSession + 1

      notifier.notify({
        title: pkg.name,
        message: format(constants.MESSAGE.COUNTDOWN_TIME_FINISHED, this._maxCountTime),
        icon: path.join(__dirname, '../images/pomodoro.png'),
        sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForCountDown + '.mp3'))
          ? constants.soundFileForCountDown : 'Blow',
        notifyTimeout: constants.notifyTimeout,
        wait: true
      },
      function () {
        self.currentTimer.stop()

        if (self._maxBreakTime) {
          // break 완료 후 다음 세션 시작 (순차 실행)
          self._breakTimer(currentSession)
        } else if (currentSession <= (self._maxSession || 1)) {
          self._pomodoroTimer(currentSession)
        }
      })
    })
  }
}
```

### 1.5 `_breakTimer` 재작성

- `this.currentTimer`에 할당하여 SIGINT 핸들링 가능하게 함
- long-term break 분기 추가
- break 완료 후 다음 세션 시작하는 콜백 흐름

```js
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
      sound: fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForBreakTime + '.mp3'))
        ? constants.soundFileForBreakTime : 'Blow',
      notifyTimeout: constants.notifyTimeout,
      wait: true
    }, function () {
      self.currentTimer.stop()
      // long break 후에는 세션 카운터 리셋
      if (isLongBreak) {
        currentSession = 1
      }
      if (self._maxCountTime) {
        self._pomodoroTimer(currentSession)
      }
    })
  })
}
```

### 1.6 `_writeToSingleLine` TTY 체크

```js
_writeToSingleLine (text) {
  if (process.stdout.isTTY) {
    process.stdout.clearLine()
    process.stdout.cursorTo(0)
  }
  process.stdout.write(text)
}
```

---

## 2. `src/constants.js` 변경사항

### 2.1 플랫폼별 사운드 경로

```js
import os from 'os'
import path from 'path'

function getSoundPath () {
  if (process.platform === 'darwin') {
    return path.join(os.homedir(), 'Library', 'Sounds')
  }
  return path.join(os.homedir(), '.local', 'share', 'sounds')
}

const constants = {
  // ... 기존 필드 유지
  userHomeLibrarySoundPath: getSoundPath(),
  // ...
}
```

---

## 3. `package.json` 변경사항

### 3.1 미사용 의존성 제거

`dependencies`에서 아래 항목 삭제:
- `ascii-numbers`
- `piggy-bank`

### 3.2 Mocha → Jest 전환

**devDependencies 제거:**
- `mocha`
- `expect` (Jest에 내장)

**devDependencies 추가:**
- `jest`
- `babel-jest` (Babel과 Jest 연동)

**scripts 변경:**
```json
{
  "test": "jest",
  "coverage": "jest --coverage"
}
```

**jest 설정 추가 (package.json):**
```json
{
  "jest": {
    "transform": {
      "^.+\\.js$": "babel-jest"
    },
    "testMatch": ["**/test/**/*.test.js"]
  }
}
```

---

## 4. 테스트 변경사항

### 4.1 기존 파일 삭제

- `test/TimerPomodoroTest.js` 삭제

### 4.2 `test/TimerPomodoro.test.js` 신규 작성 (Jest)

```js
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
```
