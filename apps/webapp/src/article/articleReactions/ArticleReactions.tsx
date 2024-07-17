import { memo, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { faAdd } from '@fortawesome/free-solid-svg-icons';
import {
  Button,
  CircularProgress,
  LinearProgress,
  ListItem,
  MenuList,
  Popover,
} from '@lotta-schule/hubert';
import { useMutation, useSuspenseQuery } from '@apollo/client';
import { ArticleModel, ArticleReactionType } from 'model';
import { Icon } from 'shared/Icon';
import { ReactionSelector } from './ReactionSelector';
import { ReactionCountButtons } from './ReactionCountButtons';
import { iconForReactionType } from './supportedReactionIcons';
import { ReactionUserList } from './RactionUserList';

import styles from './ArticleReactions.module.scss';

import GetArticleReactionCounts from 'api/query/GetArticleReactionCounts.graphql';
import ReactToArticleMutation from 'api/mutation/ReactToArticleMutation.graphql';

export type ArticleReactionsProps = {
  article: ArticleModel;
};

export const ArticleReactions = memo(({ article }: ArticleReactionsProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const typeButtonRef = useRef<HTMLButtonElement | null>(null);
  const [isReactionSelectorOpen, setIsReactionSelectorOpen] = useState(false);
  const [selectedReactionType, setSelectedReactionType] =
    useState<ArticleReactionType | null>(null);

  useEffect(() => {
    if (selectedReactionType) {
      setIsReactionSelectorOpen(false);
    }
  }, [selectedReactionType]);

  const [reactToArticle] = useMutation(ReactToArticleMutation);
  const {
    data: {
      article: { reactionCounts },
    },
  } = useSuspenseQuery<{
    article: Required<Pick<ArticleModel, 'reactionCounts'>>;
  }>(GetArticleReactionCounts, {
    variables: { id: article.id },
  });

  const selectedReactionTypeIcon = useMemo(
    () => selectedReactionType && iconForReactionType(selectedReactionType),
    [selectedReactionType]
  );

  const selectedReactionTypeCount = useMemo(
    () =>
      selectedReactionType &&
      reactionCounts.find((reaction) => reaction.type === selectedReactionType)
        ?.count,
    [selectedReactionType, reactionCounts]
  );

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
            });
          }
          setIsReactionSelectorOpen(false);
        }}
      />
      <ReactionCountButtons
        reactions={reactionCounts}
        onSelect={(type, el) => {
          typeButtonRef.current = el;
          setSelectedReactionType(type);
        }}
      />
      <Popover
        isOpen={!!selectedReactionType}
        trigger={typeButtonRef.current!}
        placement={'top'}
        onClose={() => setSelectedReactionType(null)}
      >
        <Suspense
          fallback={
            <MenuList>
              {selectedReactionTypeIcon && (
                <ListItem
                  isHeader
                  leftSection={
                    <Icon
                      icon={iconForReactionType(selectedReactionType!)!.icon}
                    />
                  }
                >
                  {selectedReactionTypeCount}
                </ListItem>
              )}
              <ListItem>
                <LinearProgress isIndeterminate />
              </ListItem>
            </MenuList>
          }
        >
          {selectedReactionType && (
            <ReactionUserList
              articleId={article.id}
              reaction={selectedReactionType}
              header={
                selectedReactionTypeIcon && (
                  <ListItem
                    isHeader
                    leftSection={
                      <Icon
                        icon={iconForReactionType(selectedReactionType!)!.icon}
                      />
                    }
                  >
                    {selectedReactionTypeCount}
                  </ListItem>
                )
              }
            />
          )}
        </Suspense>
      </Popover>
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
