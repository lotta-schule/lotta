import React, { FunctionComponent, memo } from 'react';
import { ArticleModel } from '../../model';
import { Card, CardMedia, CardContent, Typography } from '@material-ui/core';
import { Link } from '../general/Link';


interface ArticlePreviewProps {
    article: ArticleModel;
}

export const ArticlePreview: FunctionComponent<ArticlePreviewProps> = memo(({ article }) => (
    <Card key={article.id}>
        <div style={{ display: 'flex' }}>
            <CardMedia
                style={{ width: 200, margin: 7, }}
                image={article.previewImage}
                title={`Vorschaubild zu ${article.title}`}
            />
            <CardContent>
                <Typography component="h2" variant="headline" gutterBottom>
                    <Link color='inherit' underline='none' to={`/page/${article.pageName || article.id}`}>
                        Titel: {article.title}
                    </Link>
                </Typography>
                <Typography variant={'subtitle1'} color="textSecondary">
                    {article.updatedAt.toString()}
                    {article.pageName && <>&bull; {article.pageName}</>}
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