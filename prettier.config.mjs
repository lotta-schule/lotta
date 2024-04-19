/** @type {import("prettier").Config} */
const config = {
  trailingComma: 'es5',
  tabWidth: 2,
  singleQuote: true,
  overrides: [
    {
      files: ['*.html', '*.scss', '*.css'],
      options: {
        tabWidth: 4,
        singleQuote: false,
      },
    },
  ],
};

export default config;
