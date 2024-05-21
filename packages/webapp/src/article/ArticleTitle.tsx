import * as React from 'react';
import { ArticleModel } from 'model';
import { LegacyHeader } from 'layout';
import { User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { Box } from '@lotta-schule/hubert';
import { ArticlePreview } from 'article/preview/ArticlePreview';

export interface ArticleTitleProps {
  article: ArticleModel;
  onUpdate?: (article: ArticleModel) => void;
}

export const ArticleTitle = React.memo<ArticleTitleProps>(
  ({ article, onUpdate }) => {
    const currentUser = useCurrentUser();

    const showEditSection =
      !onUpdate &&
      (User.canEditArticle(currentUser, article) || User.isAdmin(currentUser));
    return (
      <Box style={{ borderRadius: 0 }}>
        <LegacyHeader>
          <ArticlePreview
            article={article}
            isEmbedded
            disableLink
            onUpdateArticle={onUpdate}
            disableEdit={!showEditSection}
            disablePin={!User.isAdmin(currentUser)}
          />
        </LegacyHeader>
      </Box>
    );
  }
);
ArticleTitle.displayName = 'ArticleTitle';
