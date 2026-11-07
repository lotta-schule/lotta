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
  HEART: { icon: faHeart, label: 'Herz' },
  HEART_CRACK: { icon: faHeartCrack, label: 'Gebrochenes Herz' },
  FACE_SMILE: { icon: faFaceSmile, label: 'Lächeln' },
  FACE_FLUSHED: { icon: faFaceFlushed, label: 'Verlegen' },
  LEMON: { icon: faLemon, label: 'Zitrone' },
  PEPPER: { icon: faPepperHot, label: 'Peperoni' },
  THUMB_UP: { icon: faThumbsUp, label: 'Daumen hoch' },
  SKULL: { icon: faSkull, label: 'Totenkopf' },
} as const;

export const supportedReactionIconNames = Object.keys(
  supportedReactionIcons
) as (keyof typeof supportedReactionIcons)[];

export const iconForReactionType = (
  reactionType: (typeof supportedReactionIconNames)[number]
): { icon: IconDefinition; label: string } | null =>
  supportedReactionIcons[reactionType as keyof typeof supportedReactionIcons] ||
  null;
