import {
  faFaceFlushed,
  faFaceSmile,
  faHeart,
  faHeartCrack,
  faLemon,
  faPepperHot,
  faSkull,
  faThumbsUp,
  IconDefinition,
} from '@fortawesome/free-solid-svg-icons';

export const supportedReactionIcons = {
  HEART: {
    icon: faHeart,
  },
  HEART_CRACK: {
    icon: faHeartCrack,
  },
  FACE_SMILE: { icon: faFaceSmile },
  FACE_FLUSHED: { icon: faFaceFlushed },
  LEMON: { icon: faLemon },
  PEPPER: { icon: faPepperHot },
  THUMB_UP: { icon: faThumbsUp },
  SKULL: { icon: faSkull },
} as const;

export const supportedReactionIconNames = Object.keys(
  supportedReactionIcons
) as (keyof typeof supportedReactionIcons)[];

export const iconForReactionType = (
  reactionType: (typeof supportedReactionIconNames)[number]
): { icon: IconDefinition } | null =>
  supportedReactionIcons[reactionType as keyof typeof supportedReactionIcons] ||
  null;
