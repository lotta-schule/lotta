## 6.0.21 (2025-08-06)

### 🚀 Features

- **hubert:** Make Badges themable ([#468](https://github.com/lotta-schule/lotta/pull/468))

### ❤️ Thank You

- Alexis Rinaldoni @ptitmouton

## 6.0.20 (2025-08-04)

### 🩹 Fixes

- **core:** PushNotification were not sent ([4b23ac05](https://github.com/lotta-schule/lotta/commit/4b23ac05))

### ❤️ Thank You

- Alexis Rinaldoni

## 6.0.19 (2025-08-03)

### 🩹 Fixes

- UserGroups can now be updated again ([#466](https://github.com/lotta-schule/lotta/pull/466))
- **webapp:** Make SearchUserField suggestions visible again ([#465](https://github.com/lotta-schule/lotta/pull/465))

### ❤️ Thank You

- Alexis Rinaldoni @ptitmouton

## 6.0.18 (2025-07-17)

### 🩹 Fixes

- **core:** Reenable Push Notifications to iOS ([#461](https://github.com/lotta-schule/lotta/pull/461))

### ❤️ Thank You

- Alexis Rinaldoni @ptitmouton

## 6.0.17 (2025-07-13)

This was a version bump only, there were no code changes.

## 6.0.16 (2025-07-13)

This was a version bump only, there were no code changes.

## 6.0.15 (2025-07-12)

This was a version bump only, there were no code changes.

## 6.0.14 (2025-07-12)

This was a version bump only, there were no code changes.

## 6.0.13 (2025-07-12)

This was a version bump only, there were no code changes.

## 6.0.12 (2025-07-12)

This was a version bump only, there were no code changes.

## 6.0.11 (2025-07-12)

This was a version bump only, there were no code changes.

## 6.0.10 (2025-07-12)

### 🩹 Fixes

- **core:** Small adjustments on file_uuid and remote_location removal ([468aa5d0](https://github.com/lotta-schule/lotta/commit/468aa5d0))

### ❤️ Thank You

- Alexis Rinaldoni

## 6.0.9 (2025-07-12)

### 🚀 Features

- **core:** split up migrations into schema and db content for easier biting ([43dfcc78](https://github.com/lotta-schule/lotta/commit/43dfcc78))

### ❤️ Thank You

- Alexis Rinaldoni

## 6.0.8 (2025-07-11)

This was a version bump only, there were no code changes.

## 6.0.7 (2025-07-11)

### 🩹 Fixes

- **core:** set correct file name when migrating storage to new paths ([3b80a37d](https://github.com/lotta-schule/lotta/commit/3b80a37d))

### ❤️ Thank You

- Alexis Rinaldoni

## 6.0.6 (2025-07-11)

This was a version bump only, there were no code changes.

## 6.0.5 (2025-07-11)

This was a version bump only, there were no code changes.

## 6.0.4 (2025-07-11)

This was a version bump only, there were no code changes.

## 6.0.3 (2025-07-11)

This was a version bump only, there were no code changes.

## 6.0.2 (2025-07-11)

This was a version bump only, there were no code changes.

## 6.0.1 (2025-07-11)

This was a version bump only, there were no code changes.

# 6.0.0 (2025-07-11)

### 🚀 Features

- rewrite complete asset managment with homemade file conversion ([#425](https://github.com/lotta-schule/lotta/pull/425))
- **ci:** Create multi-platform docker images as build output ([#387](https://github.com/lotta-schule/lotta/pull/387))
- **core:** Send feedback to cockpit by default instead of sending mail ([#413](https://github.com/lotta-schule/lotta/pull/413))
- **core:** Remove videoplay-200 formats, make format/file unique, discard unsupported formats ([#434](https://github.com/lotta-schule/lotta/pull/434))
- **core:** Faster load times via more efficient queries ([#436](https://github.com/lotta-schule/lotta/pull/436))
- **core:** Make Oban queues configurable ([#454](https://github.com/lotta-schule/lotta/pull/454))
- **core:** Extract metadata for pdf ([414752d0](https://github.com/lotta-schule/lotta/commit/414752d0))
- **core-api:** Add timezone to calendar events ([#400](https://github.com/lotta-schule/lotta/pull/400))
- **e2e:** Setup E2E testing ([#401](https://github.com/lotta-schule/lotta/pull/401))
- **webapp:** ReactionCount: Add space between icon and counter ([#405](https://github.com/lotta-schule/lotta/pull/405))
- **webapp:** fadeIn images when loaded ([#437](https://github.com/lotta-schule/lotta/pull/437))
- **webapp:** Update Privacy Page (remove keycdn and cloudimage) ([#455](https://github.com/lotta-schule/lotta/pull/455))
- **webapp:** Admin: After creating cal event, show it in calendar ([#457](https://github.com/lotta-schule/lotta/pull/457))

### 🩹 Fixes

- **core:** Send background push notifications as such for "read_conversation" event ([#408](https://github.com/lotta-schule/lotta/pull/408))
- **core:** Fix undefined behaviour when a crashed conversion worker is retried ([7dca9f73](https://github.com/lotta-schule/lotta/commit/7dca9f73))
- **core:** Do not allow nil-values for UserGroup#enrollment_tokens ([#452](https://github.com/lotta-schule/lotta/pull/452))
- **core:** Show full-day events starting from today instead of tomorrow ([#456](https://github.com/lotta-schule/lotta/pull/456))
- **core-api:** Make day-long events compatible with apple calendar ([#394](https://github.com/lotta-schule/lotta/pull/394))
- **core-api:** Calendars: Fix ICS for recurring events and events with descriptions ([277558fc](https://github.com/lotta-schule/lotta/commit/277558fc))
- **core-api:** Use full-day dtend exclusivly in ics renderer ([2865c28b](https://github.com/lotta-schule/lotta/commit/2865c28b))
- **hubert:** Set correct size for PopoverContent ([#442](https://github.com/lotta-schule/lotta/pull/442))
- **webapp:** Image ContentModule: Set image max-width to 100% ([#396](https://github.com/lotta-schule/lotta/pull/396))
- **webapp:** Make admin/users page scrollable again ([#397](https://github.com/lotta-schule/lotta/pull/397))
- **webapp:** Use correct websocket endpoint ([4f8fd9ed](https://github.com/lotta-schule/lotta/commit/4f8fd9ed))
- **webapp:** Readd background to "related articles" ([#406](https://github.com/lotta-schule/lotta/pull/406))
- **webapp:** Stop showing past recurring events in Calendar widget ([#412](https://github.com/lotta-schule/lotta/pull/412))
- **webapp:** limit image module width so it stays centered ([#414](https://github.com/lotta-schule/lotta/pull/414))
- **webapp:** Allow to set an external calendar ([#416](https://github.com/lotta-schule/lotta/pull/416))
- **webapp:** Use correct font color for text in popovers ([#423](https://github.com/lotta-schule/lotta/pull/423))
- **webapp:** Make sticky EditToolbar for text module be sticky again 💦 ([#424](https://github.com/lotta-schule/lotta/pull/424))
- **webapp:** Show two columns for galleries on mobile ([#429](https://github.com/lotta-schule/lotta/pull/429))
- **webapp:** Make ResponsiveImage a client component ([ce4640b5](https://github.com/lotta-schule/lotta/commit/ce4640b5))
- **webapp:** Administration: Save changes made to subcategories sorting ([#441](https://github.com/lotta-schule/lotta/pull/441))
- **webapp:** Correctly compute url of files' "original" format ([#450](https://github.com/lotta-schule/lotta/pull/450))
- **webapp:** Make fetching of articles in category page more consistent ([#451](https://github.com/lotta-schule/lotta/pull/451))
- **webapp:** Fix wrong ArticlePreview image size ([fda4f343](https://github.com/lotta-schule/lotta/commit/fda4f343))
- **webapp:** Add correct margin to paragraphs in (Slate Editor) ([#453](https://github.com/lotta-schule/lotta/pull/453))

### ❤️ Thank You

- Alexis Rinaldoni @ptitmouton
- Billy

## 5.0.11 (2024-09-12)


### 🩹 Fixes

- **webapp:** Fix wrong token expiration comparison ([#384](https://github.com/lotta-schule/lotta/pull/384))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton

## 5.0.10 (2024-09-12)


### 🩹 Fixes

- **core-api:** Remove expired refreshtoken cookies to avoid failing refresh ([#382](https://github.com/lotta-schule/lotta/pull/382))
- **webapp:** Remove white background from text contentModule edittoolbar ([#383](https://github.com/lotta-schule/lotta/pull/383))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton

## 5.0.9 (2024-09-12)


### 🚀 Features

- **hubert:** Update icon for draggable list element handle ([#379](https://github.com/lotta-schule/lotta/pull/379))
- **webapp:** Add a daily view to calendar ([#374](https://github.com/lotta-schule/lotta/pull/374))
- **webapp:** Article EditMode: Add a background color to editable modules ([#378](https://github.com/lotta-schule/lotta/pull/378))

### 🩹 Fixes

- **core-api:** Return 404 when file or file_converstion is not found ([#376](https://github.com/lotta-schule/lotta/pull/376))
- **hubert:** SortableDraggableList: Apply dragging styles to children ([#372](https://github.com/lotta-schule/lotta/pull/372))
- **hubert:** Correctly center icons in icon-only buttons on Chromium ([#377](https://github.com/lotta-schule/lotta/pull/377))
- **webapp:** CalendarWidget: Internal Events: Stop showing times for full-day events ([#371](https://github.com/lotta-schule/lotta/pull/371))
- **webapp:** Articles: Anon users: Disable "reacting" & "show reactions" buttons ([#373](https://github.com/lotta-schule/lotta/pull/373))
- **webapp:** Correctly check access token expiration on client side ([#375](https://github.com/lotta-schule/lotta/pull/375))
- **webapp:** Corrected two column view for article preview in user/tag article list ([#380](https://github.com/lotta-schule/lotta/pull/380))
- **webapp:** Fix EditMode GridList overlapping page layout ([#381](https://github.com/lotta-schule/lotta/pull/381))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton
- Billy

## 5.0.8 (2024-09-04)


### 🚀 Features

- **core-api:** Basic :telemetry support ([#365](https://github.com/lotta-schule/lotta/pull/365))

### 🩹 Fixes

- **core-api:** Make subscription of calendars work again ([#364](https://github.com/lotta-schule/lotta/pull/364))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton

## 5.0.7 (2024-09-03)


### 🩹 Fixes

- **core-api:** articles: Better error handling on string -> int conversion  d4027c ([#361](https://github.com/lotta-schule/lotta/pull/361))
- **core-api:** file search: Return error instead of crashing for unauthenticated users ([#362](https://github.com/lotta-schule/lotta/pull/362))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton

## 5.0.6 (2024-09-02)


### 🚀 Features

- **webapp:** Enable sentry back in prod ([70dac006](https://github.com/lotta-schule/lotta/commit/70dac006))

### 🩹 Fixes

- **core-api:** Correctly handle bad response from analytics tool ([#359](https://github.com/lotta-schule/lotta/pull/359))
- **core-api:** Send 404 when file has not been found, check id format ([#360](https://github.com/lotta-schule/lotta/pull/360))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton

## 5.0.5 (2024-09-01)


### 🩹 Fixes

- **core-api:** Apply SQL.Sandbox pooling for ecto only in test env ([d879ed4f](https://github.com/lotta-schule/lotta/commit/d879ed4f))

### ❤️  Thank You

- Alexis Rinaldoni

## 5.0.4 (2024-09-01)


### 🩹 Fixes

- **core-api:** Use correct adapter for every env except test ([#356](https://github.com/lotta-schule/lotta/pull/356))
- **webapp:** Add back availability to see events outside of own month, fix eslint setup ([#351](https://github.com/lotta-schule/lotta/pull/351))
- **webapp:** Fix safari shrunking contents of UserArticlesDialog ([#355](https://github.com/lotta-schule/lotta/pull/355))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton

## 5.0.3 (2024-09-01)

This was a version bump only, there were no code changes.

## 5.0.2 (2024-09-01)


### 🚀 Features

- Provide an identifier for tenants to have uniform recognizable addresses ([1c70a32f](https://github.com/lotta-schule/lotta/commit/1c70a32f))

### 🩹 Fixes

- **webapp:** Stop ArticleReaction dialog from disappearing from mobile viewport ([#348](https://github.com/lotta-schule/lotta/pull/348))
- **webapp:** Stop UserArticlesDialog from scrolling everywhere ([#349](https://github.com/lotta-schule/lotta/pull/349))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton

## 5.0.1 (2024-09-01)

This was a version bump only, there were no code changes.

# 5.0.0 (2024-09-01)


### 🚀 Features

- Add X-Lotta-Originary-Host, takes precedence when rec tenant ([55c24cf4](https://github.com/lotta-schule/lotta/commit/55c24cf4))
- Add Feedbacks ([22ac7274](https://github.com/lotta-schule/lotta/commit/22ac7274))
- Add possibility to react to articles ([#274](https://github.com/lotta-schule/lotta/pull/274))
- **core:** Add Push notification support for android ([2418036a](https://github.com/lotta-schule/lotta/commit/2418036a))
- **core:** Reorganize project configuration ([#23](https://github.com/lotta-schule/lotta/pull/23))
- **core:** Add endpoints returning tenant analytics data ([#24](https://github.com/lotta-schule/lotta/pull/24))
- **core:** Automatically unpublish articles of single just-deleted group ([#26](https://github.com/lotta-schule/lotta/pull/26))
- **core:** find users with *no group* via admin user search ([#27](https://github.com/lotta-schule/lotta/pull/27))
- **hubert:** use native html dialogs ([#251](https://github.com/lotta-schule/lotta/pull/251))
- **hubert:** Create Pill button ([#280](https://github.com/lotta-schule/lotta/pull/280))
- **hubert:** Allow confirming combobox input on other keys than ENTER ([#298](https://github.com/lotta-schule/lotta/pull/298))
- **search:** Remove Elasticsearch, execute search via postgres ([8ac3f018](https://github.com/lotta-schule/lotta/commit/8ac3f018))
- **webapp:** Add new media browser ([#214](https://github.com/lotta-schule/lotta/pull/214))
- **webapp:** User App Router for admin section ([#250](https://github.com/lotta-schule/lotta/pull/250))
- **webapp:** drag-drop library replacement ([#262](https://github.com/lotta-schule/lotta/pull/262))
- **webapp:** Limit height of images in IMAGE ContentModule to roughly screen height, with option to disable ([#259](https://github.com/lotta-schule/lotta/pull/259))
- **webapp:** Do not show multimedia modules if no file is set ([#269](https://github.com/lotta-schule/lotta/pull/269))
- **webapp:** Messaging: Compose message should not have autofocus ([#268](https://github.com/lotta-schule/lotta/pull/268))
- **webapp:** ArticlesByTag - break long words (tags) ([#270](https://github.com/lotta-schule/lotta/pull/270))
- **webapp:** ArticlePreview: Added gradient to AvatarGroup for transition with preview text ([#271](https://github.com/lotta-schule/lotta/pull/271))
- **webapp:** Do not autoclose config of image + title contentmodules ([#272](https://github.com/lotta-schule/lotta/pull/272))
- **webapp:** Add additional fonts ([#273](https://github.com/lotta-schule/lotta/pull/273))
- **webapp:** Analytics: Add '30d' and property breakdown views ([#293](https://github.com/lotta-schule/lotta/pull/293))
- **webapp:** Optimize admin/analytics page for mobile ([57dfc52b](https://github.com/lotta-schule/lotta/commit/57dfc52b))
- **webapp:** Add list of all article's users to UserArticlesDialog ([#295](https://github.com/lotta-schule/lotta/pull/295))
- **webapp:** Add Search to FileExplorer ([#296](https://github.com/lotta-schule/lotta/pull/296))
- **webapp:** Use LoadingButton in ProfilePage ([#341](https://github.com/lotta-schule/lotta/pull/341))
- **webapp:** Make Loadingbutton fail when login fails ([#344](https://github.com/lotta-schule/lotta/pull/344))
- **webapp:** Add LoadingButton to UserEditPermissionsDialog ([#345](https://github.com/lotta-schule/lotta/pull/345))

### 🩹 Fixes

- Fix wrong usage of Enum#slice (which MUST have an upper border ([6803bf3e](https://github.com/lotta-schule/lotta/commit/6803bf3e))
- Feedback mails: Set feedback_sender as from ([5f28655a](https://github.com/lotta-schule/lotta/commit/5f28655a))
- **core:** Fix otel bug with wrong var pinning ([52be4546](https://github.com/lotta-schule/lotta/commit/52be4546))
- **core:** Remove doubled code ([015cb836](https://github.com/lotta-schule/lotta/commit/015cb836))
- **core:** Make PushNotification schedule call async ([afad54b7](https://github.com/lotta-schule/lotta/commit/afad54b7))
- **core:** Make pushnotifications be sent activly instead of being triggered ([24a13cfd](https://github.com/lotta-schule/lotta/commit/24a13cfd))
- **core-api:** Database: Make UserGroup.is_admin_group non-nullable ([#319](https://github.com/lotta-schule/lotta/pull/319))
- **core-api:** DB: Make sortkey of usergroup non-nullable ([#320](https://github.com/lotta-schule/lotta/pull/320))
- **core-api:** Allow authInfo to return null fields ([#327](https://github.com/lotta-schule/lotta/pull/327))
- **hubert:** correctly center LoadingButton icon ( ([#215](https://github.com/lotta-schule/lotta/pull/215))
- **hubert:** Adjust CircularProgress textLength ([#238](https://github.com/lotta-schule/lotta/pull/238))
- **hubert:** Move @epic-web/invariant dep from workspace root to hubert ([eaec8e9d](https://github.com/lotta-schule/lotta/commit/eaec8e9d))
- **hubert:** Fix autogrowing textareas not having correct size ([#287](https://github.com/lotta-schule/lotta/pull/287))
- **hubert:** Fix File Explorer not being visible when in dialog on safari ([#289](https://github.com/lotta-schule/lotta/pull/289))
- **hubert:** Reset Styling of GroupedButtons in and with dialogs ([#308](https://github.com/lotta-schule/lotta/pull/308))
- **hubert:** Set correct circular progress size ([#310](https://github.com/lotta-schule/lotta/pull/310))
- **hubert:** Listbox would throw error when it should be focused ([#321](https://github.com/lotta-schule/lotta/pull/321))
- **hubert:** Limit the height of Select listboxes ([#335](https://github.com/lotta-schule/lotta/pull/335))
- **hubert:** Stop propagation of onClose event in dialogs ([#343](https://github.com/lotta-schule/lotta/pull/343))
- **webapp:** SplitView is too broad on mobile devices so view can be outscrolled ([#242](https://github.com/lotta-schule/lotta/pull/242))
- **webapp:** Fix Link to categories in admin page ([#256](https://github.com/lotta-schule/lotta/pull/256))
- **webapp:** Fix problem where opening the admin page of a group could crash app ([#263](https://github.com/lotta-schule/lotta/pull/263))
- **webapp:** Fix problem not showing image contentmodule in editmode ([#288](https://github.com/lotta-schule/lotta/pull/288))
- **webapp:** Rename color themes ([#297](https://github.com/lotta-schule/lotta/pull/297))
- **webapp:** Admin-Section: General: Stop logo from overlapping description on mobile devices ([#307](https://github.com/lotta-schule/lotta/pull/307))
- **webapp:** Fix selecting files in admin routes ([#318](https://github.com/lotta-schule/lotta/pull/318))
- **webapp:** CreateArticleDialog did not open correctly in UserNavigation ([#323](https://github.com/lotta-schule/lotta/pull/323))
- **webapp:** set correct multipart header ([#334](https://github.com/lotta-schule/lotta/pull/334))
- **webapp:** AdminSection / Users: Make Popovers on Safari not overflow ([#339](https://github.com/lotta-schule/lotta/pull/339))
- **webapp:** AdminPage: Make AdminPage scrollable again ([#347](https://github.com/lotta-schule/lotta/pull/347))

### ❤️  Thank You

- Alexis Rinaldoni @ptitmouton
- Billy

# Change Log

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

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
