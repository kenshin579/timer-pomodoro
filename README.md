# Timer Pomodoro

> A simple CLI-based Pomodoro Timer (Node.js) with system notifications and sound alerts.

## Feature

- Track the number of work sessions
- Automatic long break after reaching the max session count (default: 4)
- System popup notifications (node-notifier) + sound alerts
- Notification messages in Korean at countdown/break transitions
- Graceful termination with Ctrl+C at any time

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

Or install from source:

```sh
$ git clone https://github.com/kenshin579/timer-pomodoro
$ cd timer-pomodoro
$ npm install
```

## Usage

Type `timer-pomodoro` to see the help usage:

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

Start a 25-minute work timer with a 5-minute break:
```sh
$ timer-pomodoro -t 25 -b 5
```

Start a 20-minute work timer only:
```sh
$ timer-pomodoro -t 20
```

## Development

```bash
npm install                # Install dependencies
npm run compile            # Babel ES6→ES5: src/ → lib/
npm run compile:watch      # Compile with file watching
npm start                  # Run compiled app (lib/app.js)
npm test                   # Run Jest tests
npm run lint               # Standard.js linter with --fix
npm run coverage           # Coverage report
npm run release:patch      # lint + compile + version bump + publish
```

## Todo

- [ ] Localize popup messages (currently Korean only)
- [ ] Add display options for timer (e.g. larger font)

## References

- [console-countdown](https://www.npmjs.com/package/console-countdown)
- [pomd](https://www.npmjs.com/package/pomd)
- [pomodoro](https://www.npmjs.com/package/pomodoro)

## License

MIT
