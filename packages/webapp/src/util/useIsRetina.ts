import { useMedia } from 'react-use';

export const useIsRetina = () => {
    return useMedia('screen and (-webkit-min-device-pixel-ratio: 2)', false);
};
