import { memo, useRef, useState } from 'react';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client';
import { useRouter } from 'next/router';
import { ArticleModel } from 'model';
import { Icon } from 'shared/Icon';
import { ReactionSelector } from './ReactionSelector';
import { iconForReactionType } from './supportedReactionIcons';

import styles from './ArticleReactions.module.scss';

import ReactToArticleMutation from 'api/mutation/ReactToArticleMutation.graphql';

export type ArticleReactionsProps = {
  article: ArticleModel;
};

export const ArticleReactions = memo(({ article }: ArticleReactionsProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();
  const [isReactionSelectorOpen, setIsReactionSelectorOpen] = useState(false);

  const [reactToArticle] = useMutation(ReactToArticleMutation);

  return (
    <div data-testid="ArticleReactions" className={styles.root}>
      <ReactionSelector
        trigger={buttonRef.current!}
        isOpen={isReactionSelectorOpen}
        onSelect={(reaction) => {
          if (reaction) {
            reactToArticle({
              variables: {
                id: article.id,
                reaction: reaction.toUpperCase(),
              },
              onCompleted: () => {
                router.reload();
              },
            });
          }
          setIsReactionSelectorOpen(false);
        }}
      />
      {article.reactionCounts
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
            onClick={() => setIsReactionSelectorOpen(true)}
          />
        ))}
      <Button
        ref={buttonRef}
        title={`Auf "${article.title}" reagieren`}
        icon={<Icon icon={faAdd} />}
        onClick={() => setIsReactionSelectorOpen(true)}
      />
    </div>
  );
});
ArticleReactions.displayName = 'ArticleReactions';
