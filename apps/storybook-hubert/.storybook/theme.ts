import { create } from 'storybook/theming';

export const theme = create({
  base: 'light',

  brandTitle: 'Hubert by lotta',
  brandUrl: 'https://lotta.schule',
  brandImage: require('../assets/lotta.svg'),
  brandTarget: '_parent',
});
