import React, { FunctionComponent, memo } from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { ArticleModel } from '../../model';
import { ConnectedUserArticleBar } from './ConnectedUserArticleBar';
import { mockUsers } from '../../mockData';
import { ArticlePreview } from './ArticlePreview';

interface ArticleProps {
    article: ArticleModel;
    isEditModeEnabled?: boolean;
}

export const Article: FunctionComponent<ArticleProps> = memo(({ article, isEditModeEnabled }) => (
    <article>
        <ArticlePreview article={article} />
        {!isEditModeEnabled && (
            <ConnectedUserArticleBar article={article} />
        )}
        {article.modules.map(contentModule => (
            <Card key={contentModule.id} component={'section'}>
                <CardContent>
                    <Typography variant={'body1'}>
                        {contentModule.text}
                    </Typography>
                </CardContent>
            </Card>
        ))}
    </article>
));