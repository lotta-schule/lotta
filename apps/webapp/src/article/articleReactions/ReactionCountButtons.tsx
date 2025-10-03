import { ArticleModel, ArticleReactionType } from 'model';
import { iconForReactionType } from './supportedReactionIcons';
import { PillButton, PopoverTrigger } from '@lotta-schule/hubert';
import { Icon } from 'shared/Icon';
import * as React from 'react';

import styles from './ReactionCountButtons.module.scss';

export const ReactionCountButtons = React.memo(
  ({
    reactions,
    onSelect,
    asPopoverTrigger,
  }: {
    reactions: Exclude<ArticleModel['reactionCounts'], undefined>;
    onSelect?: (reaction: ArticleReactionType) => void;
    asPopoverTrigger?: boolean;
  }) => {
    const maybeWrappInPopoverTrigger = React.useCallback(
      (type: string, child: any) =>
        asPopoverTrigger ? (
          <PopoverTrigger asChild key={type}>
            {child}
          </PopoverTrigger>
        ) : (
          child
        ),
      [asPopoverTrigger]
    );

    return reactions
      ?.map(({ type, count }) => ({
        type,
        icon: iconForReactionType(type),
        count,
      }))
      .filter((res) => !!res.icon)
      .map(({ type, icon, count }) =>
        maybeWrappInPopoverTrigger(
          type,
          <PillButton
            className={styles.button}
            icon={<Icon icon={icon!.icon} />}
            disabled={!count || !onSelect}
            onClick={() => onSelect?.(type)}
            key={type}
          >
            <div className={styles.count}>{count}</div>
          </PillButton>
        )
      );
  }
);
ReactionCountButtons.displayName = 'ReactionCountButtons';
