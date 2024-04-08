# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.2](https://github.com/lotta-schule/web/compare/v4.2.1...v4.2.2) (2024-04-08)

**Note:** Version bump only for package @lotta-schule/lotta

## [4.2.1](https://github.com/lotta-schule/web/compare/v4.2.0...v4.2.1) (2024-04-08)

### Bug Fixes

- **webapp:** SplitView is too broad on mobile devices so view can be outscrolled ([3e50853](https://github.com/lotta-schule/web/commit/3e5085300d0758f93c38fc02096b63c152c7dbf1))

# [4.2.0](https://github.com/lotta-schule/web/compare/v4.1.4...v4.2.0) (2024-03-29)

### Bug Fixes

- **hubert:** Apply color-variables from theme to dialog style ([#203](https://github.com/lotta-schule/web/issues/203)) ([5a2f01f](https://github.com/lotta-schule/web/commit/5a2f01f306c2493911bd8927d2f5d7b456e0d698))
- **hubert:** Correctly align trigger button in Combobox and Select ([#206](https://github.com/lotta-schule/web/issues/206)) ([0060440](https://github.com/lotta-schule/web/commit/006044094cb376db190be86d5385d982e44f4437))
- **hubert:** Make dialogs full-height on iOS (use 100dvh) ([#201](https://github.com/lotta-schule/web/issues/201)) ([240a5fa](https://github.com/lotta-schule/web/commit/240a5faadbba31a1fe2cf103c8f830cb3424285e)), closes [#127](https://github.com/lotta-schule/web/issues/127)
- **hubert:** Make dialogs on iOS take no more space than available on screen ([#187](https://github.com/lotta-schule/web/issues/187)) ([6f6db78](https://github.com/lotta-schule/web/commit/6f6db789245e577cee8f38da55c1eaa8eb588ba2)), closes [#127](https://github.com/lotta-schule/web/issues/127)
- **hubert:** vertical align text in input button ([#207](https://github.com/lotta-schule/web/issues/207)) ([b6b290f](https://github.com/lotta-schule/web/commit/b6b290f44c2296e598a9cd6fca73640170b6ee89))
- **webapp:** Add admin padding back ([#175](https://github.com/lotta-schule/web/issues/175)) ([f14a9d5](https://github.com/lotta-schule/web/commit/f14a9d5bfc75622864e7748dc16b745eb672660e)), closes [#173](https://github.com/lotta-schule/web/issues/173)
- **webapp:** Do not scroll body when drawer is open ([#174](https://github.com/lotta-schule/web/issues/174)) ([e9f2c4a](https://github.com/lotta-schule/web/commit/e9f2c4ad4efceb9e64574a6349d10e3740dc9304)), closes [#172](https://github.com/lotta-schule/web/issues/172)
- **webapp:** Fix multiline-input jitter ([#181](https://github.com/lotta-schule/web/issues/181)) ([cd111ec](https://github.com/lotta-schule/web/commit/cd111ec80caeb5b315b2e966bb87ec2ae730e65e)), closes [#178](https://github.com/lotta-schule/web/issues/178)
- **webapp:** Make calendar scrollable again ([b06c7f7](https://github.com/lotta-schule/web/commit/b06c7f729bfe7e16cf14938b5c23ecb65edfc519))
- **webapp:** Make Text-ContentModule Formatting toolbar scrollable ([#199](https://github.com/lotta-schule/web/issues/199)) ([e51e130](https://github.com/lotta-schule/web/commit/e51e130a6bca5133af1a86246610234cff501f2a))
- **webapp:** mark scrollable toolbars as such so they do not 'hang low' ([#167](https://github.com/lotta-schule/web/issues/167)) ([363fdbd](https://github.com/lotta-schule/web/commit/363fdbd5bdd828d036b6387125d623a2b0807991)), closes [#163](https://github.com/lotta-schule/web/issues/163)
- **webapp:** Remove padding in Messaging sidebar ([#180](https://github.com/lotta-schule/web/issues/180)) ([caa86a2](https://github.com/lotta-schule/web/commit/caa86a2766929ac8aba089d7d8d42d39ba75d18b)), closes [#177](https://github.com/lotta-schule/web/issues/177)
- **webapp:** Use IntersectionObserver for Splitview and add padding ([#176](https://github.com/lotta-schule/web/issues/176)) ([4fef3fe](https://github.com/lotta-schule/web/commit/4fef3fecab18d010dc0c84699c73213b16808333))

### Features

- **hubert:** Make tabbars bigger on mobile ([#202](https://github.com/lotta-schule/web/issues/202)) ([0dac6c0](https://github.com/lotta-schule/web/commit/0dac6c011d982bcbacd398861fa499df3a489fb6))
- **hubert:** Remove bottom-margin from dialogs ([#205](https://github.com/lotta-schule/web/issues/205)) ([526552a](https://github.com/lotta-schule/web/commit/526552a6195e27607d54afafad8be47ccae2bd8c))
- **hubert:** Update LoadingButton component to support icons+state ([#182](https://github.com/lotta-schule/web/issues/182)) ([4c06f01](https://github.com/lotta-schule/web/commit/4c06f013755042f1c5f13aa876dedf7dad06298c)), closes [#113](https://github.com/lotta-schule/web/issues/113)
- **hubert:** Use theme variables for tag roundness and margin ([#200](https://github.com/lotta-schule/web/issues/200)) ([6e3cc71](https://github.com/lotta-schule/web/commit/6e3cc71d39d2cf61b8883049f24778c40301b446))
- **webapp:** Add articles of sole deleted group to unpublished articles ([#179](https://github.com/lotta-schule/web/issues/179)) ([63583e3](https://github.com/lotta-schule/web/commit/63583e334cf972b12d12cdc20962abef14795455)), closes [#35](https://github.com/lotta-schule/web/issues/35)
- **webapp:** Add save-button to UserGroup Editor ([#186](https://github.com/lotta-schule/web/issues/186)) ([74e3191](https://github.com/lotta-schule/web/commit/74e319174333b3bda680139bdd9e2eceb17ccba4)), closes [#61](https://github.com/lotta-schule/web/issues/61)
- **webapp:** added dialogs for user-avatar-list and tags in article previews ([#128](https://github.com/lotta-schule/web/issues/128)) ([6891932](https://github.com/lotta-schule/web/commit/6891932d1e33813b15408c3beb61f08da3c5fd88))
- **webapp:** GroupSelect now adds an option for a 'None' selection ([#208](https://github.com/lotta-schule/web/issues/208)) ([e64470f](https://github.com/lotta-schule/web/commit/e64470febcab37dd0518720da1ab053ae714445e)), closes [#107](https://github.com/lotta-schule/web/issues/107)
- **webapp:** Make Footer fit better with many links ([#171](https://github.com/lotta-schule/web/issues/171)) ([a11b86c](https://github.com/lotta-schule/web/commit/a11b86cfdec24bf9c9a8460767989279d2c23e33))
- **webapp:** optimize privacy policy wording ([#157](https://github.com/lotta-schule/web/issues/157)) ([3e38c39](https://github.com/lotta-schule/web/commit/3e38c391356b95080a23eee585c89aea452ca8fa))
- **webapp:** Show a list of unpublished articles when a group has been deleted ([#183](https://github.com/lotta-schule/web/issues/183)) ([80c09c8](https://github.com/lotta-schule/web/commit/80c09c85ee13a591096ffedc3087aafe7fb6a391)), closes [#35](https://github.com/lotta-schule/web/issues/35)
- **webapp:** Show analytics data in admin dashboard ([#161](https://github.com/lotta-schule/web/issues/161)) ([103eb2e](https://github.com/lotta-schule/web/commit/103eb2eae508b4b0897e4224f7e4daf8ea7fe1a0))
- **webapp:** Update privacy policy ([#152](https://github.com/lotta-schule/web/issues/152)) ([89a60d6](https://github.com/lotta-schule/web/commit/89a60d602de037dc3701a2a86deae67116242baa))

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
