import React, { FunctionComponent, memo } from 'react';
import { Card, CardContent, Typography } from '@material-ui/core';
import { ArticleModel } from '../../model';
import { ArticlePreview } from './ArticlePreview';

interface ArticleProps {
    article: ArticleModel;
}

export const Article: FunctionComponent<ArticleProps> = memo(({ article }) => (
    <article>
        <ArticlePreview article={article} />
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