import * as React from 'react';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import {
  Button,
  LinearProgress,
  List,
  ListItem,
  Overlay,
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

export const ArticleReactions = React.memo(
  ({ article }: ArticleReactionsProps) => {
    const ref = React.useRef<HTMLDivElement>(null);
    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const typeButtonRef = React.useRef<HTMLButtonElement | null>(null);
    const [isReactionSelectorOpen, setIsReactionSelectorOpen] =
      React.useState(false);
    const [selectedReactionType, setSelectedReactionType] =
      React.useState<ArticleReactionType | null>(null);

    React.useEffect(() => {
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

    const selectedReactionTypeIcon = React.useMemo(
      () => selectedReactionType && iconForReactionType(selectedReactionType),
      [selectedReactionType]
    );

    const selectedReactionTypeCount = React.useMemo(
      () =>
        selectedReactionType &&
        reactionCounts.find(
          (reaction) => reaction.type === selectedReactionType
        )?.count,
      [selectedReactionType, reactionCounts]
    );

    const popperModifiers = React.useMemo(() => {
      const boundary = ref.current?.parentElement;

      if (!boundary) {
        return undefined;
      }

      return [
        {
          name: 'preventOverflow',
          options: {
            boundary,
          },
        },
      ];
    }, []);

    return (
      <div data-testid="ArticleReactions" className={styles.root} ref={ref}>
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
        <Button
          ref={buttonRef}
          title={`Auf "${article.title}" reagieren`}
          icon={<Icon icon={faHeart} />}
          onClick={() => setIsReactionSelectorOpen(true)}
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
          placement={'top-start'}
          modifiers={popperModifiers}
          onClose={() => setSelectedReactionType(null)}
        >
          <Overlay>
            <React.Suspense
              fallback={
                <List>
                  {selectedReactionTypeIcon && (
                    <ListItem
                      isHeader
                      leftSection={
                        <Icon
                          icon={
                            iconForReactionType(selectedReactionType!)!.icon
                          }
                        />
                      }
                    >
                      {selectedReactionTypeCount}
                    </ListItem>
                  )}
                  <ListItem>
                    <LinearProgress isIndeterminate />
                  </ListItem>
                </List>
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
                            icon={
                              iconForReactionType(selectedReactionType!)!.icon
                            }
                          />
                        }
                      >
                        {selectedReactionTypeCount}
                      </ListItem>
                    )
                  }
                />
              )}
            </React.Suspense>
          </Overlay>
        </Popover>
      </div>
    );
  }
);
ArticleReactions.displayName = 'ArticleReactions';
