# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

## [4.2.6](https://github.com/lotta-schule/web/compare/v4.2.4...v4.2.6) (2024-04-16)

**Note:** Version bump only for package @lotta-schule/hubert

## [4.2.4](https://github.com/lotta-schule/web/compare/v4.2.3...v4.2.4) (2024-04-15)

**Note:** Version bump only for package @lotta-schule/hubert

## [4.2.3](https://github.com/lotta-schule/web/compare/v4.2.2...v4.2.3) (2024-04-15)

**Note:** Version bump only for package @lotta-schule/hubert

## [4.2.2](https://github.com/lotta-schule/web/compare/v4.2.1...v4.2.2) (2024-04-08)

**Note:** Version bump only for package @lotta-schule/hubert

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
- **webapp:** Remove padding in Messaging sidebar ([#180](https://github.com/lotta-schule/web/issues/180)) ([caa86a2](https://github.com/lotta-schule/web/commit/caa86a2766929ac8aba089d7d8d42d39ba75d18b)), closes [#177](https://github.com/lotta-schule/web/issues/177)
- **webapp:** Use IntersectionObserver for Splitview and add padding ([#176](https://github.com/lotta-schule/web/issues/176)) ([4fef3fe](https://github.com/lotta-schule/web/commit/4fef3fecab18d010dc0c84699c73213b16808333))

### Features

- **hubert:** Make tabbars bigger on mobile ([#202](https://github.com/lotta-schule/web/issues/202)) ([0dac6c0](https://github.com/lotta-schule/web/commit/0dac6c011d982bcbacd398861fa499df3a489fb6))
- **hubert:** Remove bottom-margin from dialogs ([#205](https://github.com/lotta-schule/web/issues/205)) ([526552a](https://github.com/lotta-schule/web/commit/526552a6195e27607d54afafad8be47ccae2bd8c))
- **hubert:** Update LoadingButton component to support icons+state ([#182](https://github.com/lotta-schule/web/issues/182)) ([4c06f01](https://github.com/lotta-schule/web/commit/4c06f013755042f1c5f13aa876dedf7dad06298c)), closes [#113](https://github.com/lotta-schule/web/issues/113)
- **hubert:** Use theme variables for tag roundness and margin ([#200](https://github.com/lotta-schule/web/issues/200)) ([6e3cc71](https://github.com/lotta-schule/web/commit/6e3cc71d39d2cf61b8883049f24778c40301b446))
- **webapp:** added dialogs for user-avatar-list and tags in article previews ([#128](https://github.com/lotta-schule/web/issues/128)) ([6891932](https://github.com/lotta-schule/web/commit/6891932d1e33813b15408c3beb61f08da3c5fd88))
- **webapp:** GroupSelect now adds an option for a 'None' selection ([#208](https://github.com/lotta-schule/web/issues/208)) ([e64470f](https://github.com/lotta-schule/web/commit/e64470febcab37dd0518720da1ab053ae714445e)), closes [#107](https://github.com/lotta-schule/web/issues/107)
- **webapp:** Make Footer fit better with many links ([#171](https://github.com/lotta-schule/web/issues/171)) ([a11b86c](https://github.com/lotta-schule/web/commit/a11b86cfdec24bf9c9a8460767989279d2c23e33))

## [4.1.4](https://github.com/lotta-schule/web/compare/v4.1.2...v4.1.4) (2023-12-19)

**Note:** Version bump only for package @lotta-schule/hubert

## [4.1.2](https://github.com/lotta-schule/web/compare/v4.1.1...v4.1.2) (2023-12-15)

**Note:** Version bump only for package @lotta-schule/hubert

# 4.1.0 (2023-12-10)

### Bug Fixes

- **hubert:** Make GlobalStyles a css module so it's included into bundle ([6635a1e](https://github.com/lotta-schule/web/commit/6635a1e3ab6386db9d515304042d0f4ba5dadad3))
- **hubert:** Popover location in safari now starts on correct location 🎉 ([ba147b7](https://github.com/lotta-schule/web/commit/ba147b7bfb5f9a0cf2b130104b8d0e60850064c3))

### Features

- **webapp:** Completly rework <Select> component ([fa4ebb4](https://github.com/lotta-schule/web/commit/fa4ebb483e301b43d4801c3aea88c46b3438bd0b))

# 4.1.0-alpha.4 (2023-09-02)

**Note:** Version bump only for package @lotta-schule/hubert

# 4.1.0-alpha.3 (2023-09-02)

**Note:** Version bump only for package @lotta-schule/hubert

# 4.1.0-alpha.2 (2023-09-02)

**Note:** Version bump only for package @lotta-schule/hubert
