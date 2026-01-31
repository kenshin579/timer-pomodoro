# Timer Pomodoro

> CLI 기반 뽀모도로 타이머 (Node.js) — 시스템 알림과 사운드 알림을 지원합니다.

## Feature

- 작업 세션 수 추적
- 최대 세션(기본 4회) 도달 시 장기 휴식 자동 적용
- 시스템 팝업 알림 (node-notifier) + 사운드 알림
- 카운트다운/휴식 전환 시 알림 메시지 (한국어)
- Ctrl+C로 언제든지 타이머 종료 가능

## Table of Contents

- [Install](#install)
- [Usage](#usage)
- [Development](#development)
- [Todo](#todo)
- [References](#references)
- [License](#license)

## Install

```sh
$ npm install -g timer-pomodoro
```

또는 소스코드에서 직접 설치:

```sh
$ git clone https://github.com/kenshin579/timer-pomodoro
$ cd timer-pomodoro
$ npm install
```

## Usage

`timer-pomodoro`를 입력하면 도움말을 확인할 수 있습니다:

```sh
$ timer-pomodoro
Usage: timer-pomodoro [options]

Options:
  -V, --version      output the version number
  -t, --time [n]     the number of mins for countdown (default: 25)
  -b, --break [n]    the number of mins for break time (default: 5)
  -l, --long [n]     the number of mins for long-term break (default: 15)
  -s, --session [n]  the max number of sessions for long-term break (default: 4)
  -h, --help         output usage information

Examples:
  $ timer-pomodoro -h : show help usage
  $ timer-pomodoro -t : start 25 mins countdown timer
  $ timer-pomodoro -t 30 : start 30 mins countdown timer
  $ timer-pomodoro -t -b : start countdown and break timer with default value
  $ timer-pomodoro -t 25 -b 10 : start 25 mins countdown timer and take 10 mins break
  $ timer-pomodoro -t 25 -b 10 -s 5: start 25 mins countdown timer and take 10 mins break (repeats 5 times)
```

25분 작업 + 5분 휴식 타이머 시작:
```sh
$ timer-pomodoro -t 25 -b 5
```

20분 작업 타이머만 시작:
```sh
$ timer-pomodoro -t 20
```

## Development

```bash
npm install                # 의존성 설치
npm run compile            # Babel ES6→ES5: src/ → lib/
npm run compile:watch      # 파일 변경 감지 컴파일
npm start                  # 컴파일된 앱 실행 (lib/app.js)
npm test                   # Jest 테스트 실행
npm run lint               # Standard.js 린트 (--fix)
npm run coverage           # 커버리지 리포트
npm run release:patch      # lint + compile + version bump + publish
```

## Todo

- [ ] 팝업 메시지 다국어 지원 (현재 한국어만 지원)
- [ ] 타이머 표시 옵션 추가 (예: 큰 폰트)

## References

- [console-countdown](https://www.npmjs.com/package/console-countdown)
- [pomd](https://www.npmjs.com/package/pomd)
- [pomodoro](https://www.npmjs.com/package/pomodoro)

## License

MIT
