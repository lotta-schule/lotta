import {
  faFaceFlushed,
  faFaceSmile,
  faHeart,
  faHeartCrack,
  faLemon,
  faPepperHot,
  faSkull,
  faThumbsUp,
} from '@fortawesome/free-solid-svg-icons';

export const supportedReactionIcons = {
  heart: {
    icon: faHeart,
  },
  heartCrack: {
    icon: faHeartCrack,
  },
  faceSmile: { icon: faFaceSmile },
  faceFlushed: { icon: faFaceFlushed },
  lemon: { icon: faLemon },
  pepper: { icon: faPepperHot },
  thumbUp: { icon: faThumbsUp },
  skull: { icon: faSkull },
} as const;

export const supportedReactionIconNames = Object.keys(
  supportedReactionIcons
) as (keyof typeof supportedReactionIcons)[];
