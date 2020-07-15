import { useMediaQuery } from '@material-ui/core';

export const useIsRetina = () => {
  return useMediaQuery('screen and (-webkit-min-device-pixel-ratio: 2)');
};
