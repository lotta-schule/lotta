import * as React from 'react';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import {
  LinearProgress,
  List,
  ListItem,
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@lotta-schule/hubert';
import { useMutation, useSuspenseQuery } from '@apollo/client/react';
import { ArticleModel, ArticleReactionType } from 'model';
import { Icon } from 'shared/Icon';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ReactionCountButtons } from './ReactionCountButtons';
import { iconForReactionType } from './supportedReactionIcons';
import { ReactionUserList } from './RactionUserList';
import dynamic from 'next/dynamic';

import styles from './ArticleReactions.module.scss';

import GetArticleReactionCounts from 'api/query/GetArticleReactionCounts.graphql';
import ReactToArticleMutation from 'api/mutation/ReactToArticleMutation.graphql';

const DynamicReactionSelector = dynamic(() => import('./ReactionSelector'));

export type ArticleReactionsProps = {
  article: ArticleModel;
};

export const ArticleReactions = React.memo(
  ({ article }: ArticleReactionsProps) => {
    const currentUser = useCurrentUser();
    const ref = React.useRef<HTMLDivElement>(null);
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

    return (
      <div data-testid="ArticleReactions" className={styles.root} ref={ref}>
        {currentUser && (
          <Popover
            open={isReactionSelectorOpen}
            onOpenChange={setIsReactionSelectorOpen}
            placement={'top'}
          >
            <DynamicReactionSelector
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
            <PopoverTrigger
              title={`Auf "${article.title}" reagieren`}
              disabled={!currentUser}
              icon={<Icon icon={faHeart} />}
              onClick={() => setIsReactionSelectorOpen(true)}
            />
          </Popover>
        )}
        <Popover
          open={!!selectedReactionType}
          placement={'top-start'}
          onOpenChange={(open) => {
            if (!open) {
              setSelectedReactionType(null);
            }
          }}
        >
          <ReactionCountButtons
            asPopoverTrigger
            reactions={reactionCounts}
            onSelect={currentUser ? setSelectedReactionType : undefined}
          />
          {currentUser && (
            <PopoverContent>
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
                      <LinearProgress
                        isIndeterminate
                        aria-label="Reaaktionen werden geladen"
                      />
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
            </PopoverContent>
          )}
        </Popover>
      </div>
    );
  }
);
ArticleReactions.displayName = 'ArticleReactions';
