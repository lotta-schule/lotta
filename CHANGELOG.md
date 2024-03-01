# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.1.14](https://github.com/lotta-schule/web/compare/v4.1.13...v4.1.14) (2024-03-01)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.13](https://github.com/lotta-schule/web/compare/v4.1.12...v4.1.13) (2024-03-01)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.12](https://github.com/lotta-schule/web/compare/v4.1.10...v4.1.12) (2023-12-29)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.10](https://github.com/lotta-schule/web/compare/v4.1.8...v4.1.10) (2023-12-28)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.8](https://github.com/lotta-schule/web/compare/v4.1.7...v4.1.8) (2023-12-27)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.7](https://github.com/lotta-schule/web/compare/v4.1.6...v4.1.7) (2023-12-27)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.6](https://github.com/lotta-schule/web/compare/v4.1.4...v4.1.6) (2023-12-27)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.4](https://github.com/lotta-schule/web/compare/v4.1.2...v4.1.4) (2023-12-19)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.2](https://github.com/lotta-schule/web/compare/v4.1.1...v4.1.2) (2023-12-15)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.1.1](https://github.com/lotta-schule/web/compare/v4.1.0...v4.1.1) (2023-12-11)

**Note:** Version bump only for package @lotta-schule/lotta

# 4.1.0 (2023-12-10)

### Bug Fixes

- do not show topic markup if there is none ([8a594b2](https://github.com/lotta-schule/web/commit/8a594b2be69cb7dbd4f92adb3a664dc5f9185024))
- Dockerfile ([2ef425f](https://github.com/lotta-schule/web/commit/2ef425fb5b52218a5722afdafeafaa6bed232f24))
- **hubert:** Make GlobalStyles a css module so it's included into bundle ([6635a1e](https://github.com/lotta-schule/web/commit/6635a1e3ab6386db9d515304042d0f4ba5dadad3))
- **hubert:** Popover location in safari now starts on correct location 🎉 ([ba147b7](https://github.com/lotta-schule/web/commit/ba147b7bfb5f9a0cf2b130104b8d0e60850064c3))
- **webapp:** Add missing fetch.cjs file to docker image ([756f414](https://github.com/lotta-schule/web/commit/756f414e42b0e2c188d00c761e5b0fc8ed8f6e08))
- **webapp:** Correctly load fontawesome styles ([16afc43](https://github.com/lotta-schule/web/commit/16afc43c56e43dfec6bfb14ab3c74f1368c25cae))
- **webapp:** explicit headers ([b5177ff](https://github.com/lotta-schule/web/commit/b5177ff8792d04e898403737c3ea9256b1bafd48))
- **webapp:** Include headers to api request case-insensitivly ([dd21c7d](https://github.com/lotta-schule/web/commit/dd21c7dcd6b6af3e4c7237f01e8f319200cb161d))
- **webapp:** Scrolling Upload-Button on Desktop-Safari ([f3487a6](https://github.com/lotta-schule/web/commit/f3487a63a482ac086c565da320cd2f0f85438176))
- **webapp:** Send 'Authorize' header via ApolloClient ([0fbd228](https://github.com/lotta-schule/web/commit/0fbd228f12476f3d416c49110c11040a6aeeb5c6))
- **webapp:** Try using node-fetch instead of node's fetch ([2b94bb1](https://github.com/lotta-schule/web/commit/2b94bb177522bdd1cea949ce5c54f3b04a675925))

### Features

- **webapp:** Completly rework <Select> component ([fa4ebb4](https://github.com/lotta-schule/web/commit/fa4ebb483e301b43d4801c3aea88c46b3438bd0b))
- **webapp:** Introduce X-Lotta-Originary-Host header ([6310a9b](https://github.com/lotta-schule/web/commit/6310a9b026c311e83a2839eb6acad1c02c6d53fd))
- **webapp:** Make App Webmanifest dynamic ([6f36aae](https://github.com/lotta-schule/web/commit/6f36aae683edb72dfe339b663460045d4574b6aa))

### Reverts

- Revert "Try downgrading nextjs" ([dcf3da0](https://github.com/lotta-schule/web/commit/dcf3da03cc169e28594c88c4edda64547e282578))
- Revert "ci: add package-lock to webapp (for docker self-contained install support)" ([c019de2](https://github.com/lotta-schule/web/commit/c019de293d5dc989c389164e364560016ae035ac))
- Revert "Remove sentry from dockerfile" ([58ee0bd](https://github.com/lotta-schule/web/commit/58ee0bd54afaa608030d71e11179eebdbc0c351c))
- Revert "Update nextjs (v12.2.6)" ([176e6fb](https://github.com/lotta-schule/web/commit/176e6fb70b78cab05da14fc837313aa5c6cafdd4))
- Revert "React 18" ([6ae9df7](https://github.com/lotta-schule/web/commit/6ae9df7d9c124023df0c61f3dbf0d9495c92e452))
- Revert "settings saved button for category management" ([708e21a](https://github.com/lotta-schule/web/commit/708e21ad320908b22f44e0eb6bb1aebe542c0cdb))
- Revert "changed circual progress to linear progress display" ([7cc4d92](https://github.com/lotta-schule/web/commit/7cc4d92146bf1d0ce04ec2d186ed46ad6c1fd0fa))
- Revert "style for category widget selector in category management, incl. hard coded suggestion for a new layout" ([d7ab450](https://github.com/lotta-schule/web/commit/d7ab45032ba5da27e19873fb4645815fe59ce185))
- Revert "bg-color widget navigation" ([4270261](https://github.com/lotta-schule/web/commit/42702618e39b9448021842da0e82da4a82f0d545))
- Revert "bg-color category navigation" ([2920284](https://github.com/lotta-schule/web/commit/2920284568b09843fef1f21da9fc4bb61323dc93))
- Revert "Merge branch 'feature/run-gitlab-runner-on-own-infra' into 'develop'" ([65bdf49](https://github.com/lotta-schule/web/commit/65bdf491b04f73d12e7aa0ac6ce65ce75ca65ec9))
- Revert "fix build args" ([d3d1e8e](https://github.com/lotta-schule/web/commit/d3d1e8eb282376efcaa653fd855bbb57e2059d16))
- Revert "add variables" ([6087826](https://github.com/lotta-schule/web/commit/6087826388847c2cd275c4a8814346f75399cffe))
- Revert "remove CI_COMMIT_SHA variables" ([7d16512](https://github.com/lotta-schule/web/commit/7d16512a0a99af76a12fd14369fed3eae7815f7c))
- Revert "gitlab-ci" ([1f60bde](https://github.com/lotta-schule/web/commit/1f60bde2f60d16adaca358193c1d1168d7177cee))
- Revert "margin images (gallery view) -> size" ([61666d4](https://github.com/lotta-schule/web/commit/61666d4bb3f06840bb2778ea8fe88a7ef83bef05))
- 8d0a3d18cc50f61f85d91252456bfd4572c20ca3 ([99d471a](https://github.com/lotta-schule/web/commit/99d471a29368c9c35720938a910555085194ec2e))

# 4.1.0-alpha.4 (2023-09-02)

### Bug Fixes

- do not show topic markup if there is none ([8a594b2](https://github.com/lotta-schule/web/commit/8a594b2be69cb7dbd4f92adb3a664dc5f9185024))

### Reverts

- Revert "Remove sentry from dockerfile" ([58ee0bd](https://github.com/lotta-schule/web/commit/58ee0bd54afaa608030d71e11179eebdbc0c351c))
- Revert "Update nextjs (v12.2.6)" ([176e6fb](https://github.com/lotta-schule/web/commit/176e6fb70b78cab05da14fc837313aa5c6cafdd4))
- Revert "React 18" ([6ae9df7](https://github.com/lotta-schule/web/commit/6ae9df7d9c124023df0c61f3dbf0d9495c92e452))
- Revert "settings saved button for category management" ([708e21a](https://github.com/lotta-schule/web/commit/708e21ad320908b22f44e0eb6bb1aebe542c0cdb))
- Revert "changed circual progress to linear progress display" ([7cc4d92](https://github.com/lotta-schule/web/commit/7cc4d92146bf1d0ce04ec2d186ed46ad6c1fd0fa))
- Revert "style for category widget selector in category management, incl. hard coded suggestion for a new layout" ([d7ab450](https://github.com/lotta-schule/web/commit/d7ab45032ba5da27e19873fb4645815fe59ce185))
- Revert "bg-color widget navigation" ([4270261](https://github.com/lotta-schule/web/commit/42702618e39b9448021842da0e82da4a82f0d545))
- Revert "bg-color category navigation" ([2920284](https://github.com/lotta-schule/web/commit/2920284568b09843fef1f21da9fc4bb61323dc93))
- Revert "Merge branch 'feature/run-gitlab-runner-on-own-infra' into 'develop'" ([65bdf49](https://github.com/lotta-schule/web/commit/65bdf491b04f73d12e7aa0ac6ce65ce75ca65ec9))
- Revert "fix build args" ([d3d1e8e](https://github.com/lotta-schule/web/commit/d3d1e8eb282376efcaa653fd855bbb57e2059d16))
- Revert "add variables" ([6087826](https://github.com/lotta-schule/web/commit/6087826388847c2cd275c4a8814346f75399cffe))
- Revert "remove CI_COMMIT_SHA variables" ([7d16512](https://github.com/lotta-schule/web/commit/7d16512a0a99af76a12fd14369fed3eae7815f7c))
- Revert "gitlab-ci" ([1f60bde](https://github.com/lotta-schule/web/commit/1f60bde2f60d16adaca358193c1d1168d7177cee))
- Revert "margin images (gallery view) -> size" ([61666d4](https://github.com/lotta-schule/web/commit/61666d4bb3f06840bb2778ea8fe88a7ef83bef05))

# 4.1.0-alpha.3 (2023-09-02)

### Bug Fixes

- do not show topic markup if there is none ([8a594b2](https://github.com/lotta-schule/web/commit/8a594b2be69cb7dbd4f92adb3a664dc5f9185024))

### Reverts

- Revert "Remove sentry from dockerfile" ([58ee0bd](https://github.com/lotta-schule/web/commit/58ee0bd54afaa608030d71e11179eebdbc0c351c))
- Revert "Update nextjs (v12.2.6)" ([176e6fb](https://github.com/lotta-schule/web/commit/176e6fb70b78cab05da14fc837313aa5c6cafdd4))
- Revert "React 18" ([6ae9df7](https://github.com/lotta-schule/web/commit/6ae9df7d9c124023df0c61f3dbf0d9495c92e452))
- Revert "settings saved button for category management" ([708e21a](https://github.com/lotta-schule/web/commit/708e21ad320908b22f44e0eb6bb1aebe542c0cdb))
- Revert "changed circual progress to linear progress display" ([7cc4d92](https://github.com/lotta-schule/web/commit/7cc4d92146bf1d0ce04ec2d186ed46ad6c1fd0fa))
- Revert "style for category widget selector in category management, incl. hard coded suggestion for a new layout" ([d7ab450](https://github.com/lotta-schule/web/commit/d7ab45032ba5da27e19873fb4645815fe59ce185))
- Revert "bg-color widget navigation" ([4270261](https://github.com/lotta-schule/web/commit/42702618e39b9448021842da0e82da4a82f0d545))
- Revert "bg-color category navigation" ([2920284](https://github.com/lotta-schule/web/commit/2920284568b09843fef1f21da9fc4bb61323dc93))
- Revert "Merge branch 'feature/run-gitlab-runner-on-own-infra' into 'develop'" ([65bdf49](https://github.com/lotta-schule/web/commit/65bdf491b04f73d12e7aa0ac6ce65ce75ca65ec9))
- Revert "fix build args" ([d3d1e8e](https://github.com/lotta-schule/web/commit/d3d1e8eb282376efcaa653fd855bbb57e2059d16))
- Revert "add variables" ([6087826](https://github.com/lotta-schule/web/commit/6087826388847c2cd275c4a8814346f75399cffe))
- Revert "remove CI_COMMIT_SHA variables" ([7d16512](https://github.com/lotta-schule/web/commit/7d16512a0a99af76a12fd14369fed3eae7815f7c))
- Revert "gitlab-ci" ([1f60bde](https://github.com/lotta-schule/web/commit/1f60bde2f60d16adaca358193c1d1168d7177cee))
- Revert "margin images (gallery view) -> size" ([61666d4](https://github.com/lotta-schule/web/commit/61666d4bb3f06840bb2778ea8fe88a7ef83bef05))

# 4.1.0-alpha.2 (2023-09-02)

### Bug Fixes

- do not show topic markup if there is none ([8a594b2](https://github.com/lotta-schule/web/commit/8a594b2be69cb7dbd4f92adb3a664dc5f9185024))
