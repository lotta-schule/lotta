import { UserConfig } from 'i18next-parser';
export default {
  createOldCatalogs: false,

  defaultNamespace: 'translation',

  defaultValue: '',
  // Default value to give to keys with no value
  // You may also specify a function accepting the locale, namespace, key, and value as arguments

  indentation: 2,
  // Indentation of the catalog files

  keepRemoved: true,
  // Keep keys from the catalog that are no longer in code
  // You may either specify a boolean to keep or discard all removed keys.
  // You may also specify an array of patterns: the keys from the catalog that are no long in the code but match one of the patterns will be kept.
  // The patterns are applied to the full key including the namespace, the parent keys and the separators.

  keySeparator: false,
  // Key separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  // see below for more details
  lexers: {
    hbs: ['HandlebarsLexer'],
    handlebars: ['HandlebarsLexer'],

    htm: ['HTMLLexer'],
    html: ['HTMLLexer'],

    mjs: ['JavascriptLexer'],
    js: ['JavascriptLexer'], // if you're writing jsx inside .js files, change this to JsxLexer
    ts: ['JavascriptLexer'],
    jsx: ['JsxLexer'],
    tsx: ['JsxLexer'],

    default: ['JavascriptLexer'],
  },

  lineEnding: 'auto',
  // Control the line ending. See options at https://github.com/ryanve/eol

  locales: ['de'],
  // An array of the locales in your applications

  namespaceSeparator: false,
  // Namespace separator used in your translation keys
  // If you want to use plain english keys, separators such as `.` and `:` will conflict. You might want to set `keySeparator: false` and `namespaceSeparator: false`. That way, `t('Status: Loading...')` will not think that there are a namespace and three separator dots for instance.

  output: 'src/locale/$LOCALE.json',
  // Supports $LOCALE and $NAMESPACE injection
  // Supports JSON (.json) and YAML (.yml) file formats
  // Where to write the locale files relative to process.cwd()

  pluralSeparator: '_',
  // Plural separator used in your translation keys
  // If you want to use plain english keys, separators such as `_` might conflict. You might want to set `pluralSeparator` to a different string that does not occur in your keys.
  // If you don't want to generate keys for plurals (for example, in case you are using ICU format), set `pluralSeparator: false`.

  input: [
    'src/**/*.{ts,tsx,js,jsx}',
    '!src/util/**/*.*',
    '!src/test/**/*',
    '!src/**/*.test.ts',
    '!src/**/*.d.ts',
  ],
  // An array of globs that describe where to look for source files
  // relative to the location of the configuration file

  sort: true,
  // Whether or not to sort the catalog. Can also be a [compareFunction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort#parameters)

  verbose: true,
  // Display info about the parsing including some stats

  failOnWarnings: false,
  // Exit with an exit code of 1 on warnings

  failOnUpdate: false,
  // Exit with an exit code of 1 when translations are updated (for CI purpose)
} satisfies UserConfig;
