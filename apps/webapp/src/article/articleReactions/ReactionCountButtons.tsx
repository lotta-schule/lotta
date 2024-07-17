import { ArticleModel, ArticleReactionType } from 'model';
import { iconForReactionType } from './supportedReactionIcons';
import { Button } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import { MouseEvent } from 'react';

export const ReactionCountButtons = ({
  reactions,
  onSelect,
}: {
  reactions: Exclude<ArticleModel['reactionCounts'], undefined>;
  onSelect?: (reaction: ArticleReactionType, button: HTMLButtonElement) => void;
}) => {
  return reactions
    ?.map(({ type, count }) => ({
      type,
      icon: iconForReactionType(type),
      count,
    }))
    .filter((res) => !!res.icon)
    .map(({ type, icon, count }) => (
      <Button
        key={type}
        onlyIcon
        icon={<Icon icon={icon!.icon} />}
        onClick={(e: MouseEvent<HTMLButtonElement>) =>
          onSelect?.(type, e.currentTarget)
        }
      >
        {count}
      </Button>
    ));
};
