import { ArticleModel } from 'model';
import { iconForReactionType } from './supportedReactionIcons';
import { Button } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';

export const ReactionCountButtons = ({
  reactions,
  onSelect,
}: {
  reactions: Exclude<ArticleModel['reactionCounts'], undefined>;
  onSelect?: (reaction: string) => void;
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
        iconOnly
        icon={
          <span>
            <Icon icon={icon!.icon} /> {count}
          </span>
        }
        onClick={() => onSelect?.(type)}
      />
    ));
};
