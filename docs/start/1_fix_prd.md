# 버그 수정 및 안정화 PRD

## 배경

코드 리뷰를 통해 발견된 버그와 로직 오류를 정리한 문서이다.
기존 TODO.md에 기록된 알려진 이슈 2건의 근본 원인도 포함되어 있다.

---

## 1. Critical — 버그 수정

### 1.1 `fs.existsSync` 잘못된 사용

- **파일**: `src/TimerPomodoro.js` (61행, 95행)
- **현상**: `fs.existsSync(os.homedir(), '/Library/Sounds/', ...)` — 인자를 여러 개 전달하고 있으나 `fs.existsSync`는 첫 번째 인자만 사용한다. `os.homedir()` 경로는 항상 존재하므로 사운드 파일 존재 여부와 관계없이 항상 `true`를 반환한다.
- **수정**: `path.join()`으로 전체 경로를 하나의 문자열로 결합하여 전달한다.

```js
// Before
fs.existsSync(os.homedir(), '/Library/Sounds/', constants.soundFileForCountDown, '.mp3')

// After
fs.existsSync(path.join(os.homedir(), 'Library/Sounds', constants.soundFileForCountDown + '.mp3'))
```

### 1.2 `_getRandomNumber` 인자 누락

- **파일**: `src/TimerPomodoro.js` (94행)
- **현상**: `this._getRandomNumber()`을 인자 없이 호출하여 `NaN`을 반환한다. break 알림 이미지 경로가 `breakNaN.png`이 되어 이미지가 표시되지 않는다.
- **수정**: `break1.png` ~ `break4.png`가 존재하므로 `this._getRandomNumber(1, 4)`로 호출한다.

### 1.3 `_breakTimer`에서 `this.currentTimer` 미갱신

- **파일**: `src/TimerPomodoro.js` (81~83행)
- **현상**: break 타이머를 로컬 파라미터에만 할당하고 `this.currentTimer`를 갱신하지 않는다. SIGINT 핸들러의 `killRunningTimer()`가 이전 타이머를 참조하므로 break 중 Ctrl+C가 동작하지 않는다.
- **관련 이슈**: TODO.md — "countdown 이후 break timer가 시작되면 ctrl+c로 terminate를 못시키는 이슈"
- **수정**: break 타이머 생성 시 `this.currentTimer`에 할당한다.

```js
// Before
_breakTimer (currentTimer) {
  currentTimer = new Timr(...)

// After
_breakTimer () {
  this.currentTimer = new Timr(...)
```

### 1.4 `_maxSession` 중복 할당 / `_maxLongTermBreakTime` 누락

- **파일**: `src/TimerPomodoro.js` (24~26행)
- **현상**: constructor에서 `this._maxSession`을 두 번 할당하고, `this._maxLongTermBreakTime`은 할당하지 않는다.
- **수정**: 중복 라인을 `this._maxLongTermBreakTime = userConfig.maxLongTermBreakTime`으로 교체한다.

---

## 2. Major — 로직 수정

### 2.1 세션/브레이크 동시 실행 문제

- **파일**: `src/TimerPomodoro.js` (66~74행)
- **현상**: notification 콜백에서 다음 세션 타이머와 브레이크 타이머를 순차 없이 동시에 시작한다. 두 타이머가 동시에 동작하여 콘솔 출력이 뒤섞인다.
- **관련 이슈**: TODO.md — "break가 끝나면 pop-up 표시와 사운드가 잘못 나타남"
- **수정**: 브레이크 완료 콜백에서 다음 세션을 시작하는 순차 흐름으로 변경한다.

```
[기대 흐름]
작업 타이머 → 완료 알림 → 브레이크 타이머 → 완료 알림 → 다음 세션 타이머 → ...
```

### 2.2 Long-term break 미구현

- **파일**: `src/TimerPomodoro.js`, `src/constants.js`
- **현상**: CLI에서 `-l` 옵션으로 long-term break 시간을 받지만, 실제 로직에서는 `maxLongTermBreakTime`을 사용하지 않는다. max session 도달 시 일반 break 대신 long-term break가 적용되어야 한다.
- **수정**: `currentSession`이 `_maxSession`에 도달하면 `_maxLongTermBreakTime`을 사용하는 분기를 추가한다.

---

## 3. Medium — 안정성 개선

### 3.1 플랫폼 호환성

- **파일**: `src/constants.js` (14행), `src/TimerPomodoro.js` (114~116행)
- **현상**:
  - `~/Library/Sounds/` 경로는 macOS 전용이다. Linux/Windows에서는 에러 발생.
  - `process.stdout.clearLine()`은 TTY가 아닌 환경에서 `undefined`일 수 있다.
- **수정**: OS별 사운드 경로 분기 처리 및 TTY 체크 추가.

---

## 4. Minor — 정리

### 4.1 미사용 의존성 제거

- **파일**: `package.json`
- **대상**: `ascii-numbers` (import 없음), `piggy-bank` (주석 처리됨)
- **수정**: `npm uninstall ascii-numbers piggy-bank`

### 4.2 Mocha → Jest 전환 및 테스트 보강

- **파일**: `package.json`, `test/TimerPomodoroTest.js`
- **현상**: `Test Pomodoro` describe 블록이 비어 있고, 파일 복사 테스트에 assertion이 없다. 테스트 프레임워크(Mocha)가 assertion/mocking 라이브러리를 별도로 요구하여 설정이 번거롭다.
- **수정**:
  - Mocha + expect를 Jest로 전환 (assertion, mocking, coverage 내장)
  - `test/TimerPomodoroTest.js` 삭제 → `test/TimerPomodoro.test.js` 신규 작성
  - 테스트 항목 추가:
    - `_getRandomNumber` 범위 검증
    - constructor 설정값 할당 검증

---

## 우선순위 요약

| 순서 | 항목 | 구분 |
|------|------|------|
| 1 | `_breakTimer`에서 `this.currentTimer` 갱신 (1.3) | Critical |
| 2 | 세션/브레이크 동시 실행 → 순차 실행으로 변경 (2.1) | Major |
| 3 | `fs.existsSync` 인자 수정 (1.1) | Critical |
| 4 | `_getRandomNumber` 인자 전달 (1.2) | Critical |
| 5 | `_maxSession` 중복 → `_maxLongTermBreakTime` 할당 (1.4) | Critical |
| 6 | Long-term break 로직 구현 (2.2) | Major |
| 7 | 플랫폼 호환성 (3.1) | Medium |
| 8 | 미사용 의존성 제거 (4.1) | Minor |
| 9 | Mocha → Jest 전환 및 테스트 보강 (4.2) | Minor |
