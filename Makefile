.PHONY: install compile test lint release-patch release-minor release-major publish

install:
	npm install

compile:
	npm run compile

test:
	npm test

lint:
	npm run lint

## npm publish (patch: 0.0.1 → 0.0.2)
release-patch:
	npm run lint
	npm run compile
	npm version patch
	npm publish

## npm publish (minor: 0.1.0 → 0.2.0)
release-minor:
	npm run lint
	npm run compile
	npm version minor
	npm publish

## npm publish (major: 0.1.0 → 1.0.0)
release-major:
	npm run lint
	npm run compile
	npm version major
	npm publish
