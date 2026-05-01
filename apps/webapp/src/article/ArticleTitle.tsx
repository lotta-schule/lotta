import * as React from 'react';
import { ArticleModel } from '#/model/index.js';
import { Header } from '#/layout/index.js';
import { User } from '#/util/model/index.js';
import { useCurrentUser } from '#/util/user/useCurrentUser.js';
import { Box } from '@lotta-schule/hubert';
import { ArticlePreview } from '#/article/preview/ArticlePreview.js';

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
        <Header>
          <ArticlePreview
            article={article}
            isEmbedded
            disableLink
            onUpdateArticle={onUpdate}
            disableEdit={!showEditSection}
            disablePin={!User.isAdmin(currentUser)}
          />
        </Header>
      </Box>
    );
  }
);
ArticleTitle.displayName = 'ArticleTitle';
