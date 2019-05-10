import React, { FunctionComponent, memo } from 'react';
import { Card, CardMedia, CardContent, Typography } from '@material-ui/core';
import { ArticleModel } from '../../model';
import { ConnectedUserArticleBar } from './ConnectedUserArticleBar';
import { mockUsers } from '../../mockData';

interface ArticleProps {
    article: ArticleModel;
    isEditModeEnabled?: boolean;
}

export const Article: FunctionComponent<ArticleProps> = memo(({ article, isEditModeEnabled }) => (
    <article>
        <Card>
            <div style={{ display: 'flex' }}>
                <CardMedia
                    style={{ width: 150 }}
                    image={'https://via.placeholder.com/150x150'}
                    title={`Vorschaubild zu ${article.title}`}
                />
                <CardContent>
                    <Typography variant="h4" component="h3">
                        {article.title}
                    </Typography>
                    <Typography variant={'subtitle1'} color="textSecondary">
                        15.07.2019 &bull; Oskarverleihung &bull; 18 Views &bull; Autor: Lola &bull; Bewertung
                        </Typography>
                    <Typography variant={'subtitle1'} color="textSecondary">
                        (Füge hier einen kurzen Vorschautext von etwa 30 Wörtern ein)
                        </Typography>
                </CardContent>
            </div>
        </Card>
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