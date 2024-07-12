import { faAdd } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@lotta-schule/hubert';
import { ArticleModel } from 'model';
import { memo, useRef, useState } from 'react';
import { Icon } from 'shared/Icon';
import { ReactionSelector } from './ReactionSelector';

export type ArticleReactionsProps = {
  article: ArticleModel;
};

export const ArticleReactions = memo(({ article }: ArticleReactionsProps) => {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isReactionSelectorOpen, setIsReactionSelectorOpen] = useState(false);
  return (
    <div data-testid="ArticleReactions">
      <ReactionSelector
        trigger={buttonRef.current!}
        isOpen={isReactionSelectorOpen}
        onSelect={() => {
          setIsReactionSelectorOpen(false);
        }}
      />
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
