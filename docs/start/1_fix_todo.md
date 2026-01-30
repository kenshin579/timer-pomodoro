# 버그 수정 및 안정화 — TODO

## Phase 1: Critical 버그 수정

- [x] 1.1 `TimerPomodoro.js` constructor에서 `_maxSession` 중복 할당을 `_maxLongTermBreakTime` 할당으로 변경
- [x] 1.2 `fs.existsSync` 호출 수정 (countdown 알림, break 알림 2곳) — `path.join()`으로 단일 경로 전달
- [x] 1.3 `_getRandomNumber()` 호출에 인자 `(1, 4)` 전달
- [x] 1.4 `_breakTimer`에서 `this.currentTimer`에 새 타이머 할당 (SIGINT 핸들링 가능하도록)

## Phase 2: Major 로직 수정

- [x] 2.1 `_pomodoroTimer` notification 콜백 흐름 변경: break → 완료 → 다음 세션 (순차 실행)
- [x] 2.2 `_breakTimer`에 `currentSession` 파라미터 추가, break 완료 후 다음 세션 시작하는 콜백 연결
- [x] 2.3 Long-term break 분기 구현: `currentSession > _maxSession` 시 `_maxLongTermBreakTime` 사용
- [x] 2.4 Long-term break 후 세션 카운터 리셋

## Phase 3: 안정성 개선

- [x] 3.1 `constants.js`에서 `userHomeLibrarySoundPath`를 플랫폼별 분기 처리
- [x] 3.2 `_writeToSingleLine`에 `process.stdout.isTTY` 체크 추가

## Phase 4: 정리 및 테스트 프레임워크 전환

- [ ] 4.1 `npm uninstall ascii-numbers piggy-bank` 실행
- [ ] 4.2 `TimerPomodoro.js`에서 piggy-bank 관련 주석 코드 제거
- [ ] 4.3 Mocha → Jest 전환: `npm uninstall mocha expect` 실행
- [ ] 4.4 Jest 설치: `npm install --save-dev jest babel-jest` 실행
- [ ] 4.5 `package.json`의 `scripts.test`를 `jest`로 변경, `scripts.coverage`를 `jest --coverage`로 변경
- [ ] 4.6 `package.json`에 jest 설정 추가 (`transform`, `testMatch`)
- [ ] 4.7 `test/TimerPomodoroTest.js` 삭제, `test/TimerPomodoro.test.js` 신규 작성 (Jest)
- [ ] 4.8 테스트 작성: `_getRandomNumber` 범위 검증
- [ ] 4.9 테스트 작성: constructor 설정값 할당 검증
- [ ] 4.10 `npm run lint` 실행하여 코드 스타일 정리
- [ ] 4.11 `npm test` 전체 테스트 통과 확인
