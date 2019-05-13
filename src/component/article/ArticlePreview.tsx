import React, { FunctionComponent, memo } from 'react';
import { ArticleModel } from '../../model';
import { Card, CardMedia, CardContent, Typography, Link } from '@material-ui/core';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { CollisionLink } from '../general/CollisionLink';


interface ArticlePreviewProps {
    article: ArticleModel;
}

export const ArticlePreview: FunctionComponent<ArticlePreviewProps> = memo(({ article }) => (
    <Card key={article.id}>
        <div style={{ display: 'flex' }}>
            <CardMedia
                style={{ width: 200, margin: 7, flexShrink: 0, flexGrow: 0 }}
                image={article.previewImage}
                title={`Vorschaubild zu ${article.title}`}
            />
            <CardContent>
                <Typography component={'h4'} variant={'h4'} gutterBottom>
                    <Link component={CollisionLink} color='inherit' underline='none' to={`/page/${article.pageName || article.id}`}>
                        {article.title}
                    </Link>
                </Typography>
                <Typography variant={'subtitle1'} color="textSecondary">
                    {format(article.updatedAt, 'PPP', { locale: de }) + ' '}
                    {article.pageName && <> &bull; {article.pageName} </>}
                    &bull; 18 Views
                    &bull; Autor: Lola
                    &bull; Bewertung
                </Typography>
                <Typography variant={'subtitle1'} color="textSecondary">
                    {article.preview}
                </Typography>
            </CardContent>
        </div>
    </Card>
));