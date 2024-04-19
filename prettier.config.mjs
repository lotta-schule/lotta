/** @type {import("prettier").Config} */
const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  singleQuote: true,
  overrides: [
    {
      files: ['*.scss', '*.css'],
      options: {
        tabWidth: 2,
        singleQuote: false,
      },
    },
    {
      files: ['*.html'],
      options: {
        tabWidth: 4,
        singleQuote: false,
      },
    },
  ],
};

export default config;
