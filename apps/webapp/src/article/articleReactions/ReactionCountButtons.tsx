import { ArticleModel, ArticleReactionType } from 'model';
import { iconForReactionType } from './supportedReactionIcons';
import { PillButton } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import * as React from 'react';

import styles from './ReactionCountButtons.module.scss';

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
      <PillButton
        key={type}
        className={styles.button}
        icon={<Icon icon={icon!.icon} />}
        disabled={!count || !onSelect}
        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
          onSelect?.(type, e.currentTarget)
        }
      >
        <div className={styles.count}>{count}</div>
      </PillButton>
    ));
};
