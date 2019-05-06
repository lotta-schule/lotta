import { CategoryModel, ArticleModel } from '../../model';
import { Card, CardContent, Typography, CardMedia, Link as MuiLink } from '@material-ui/core';
import PageLayout from './PageLayout';
import React, { FunctionComponent, memo } from 'react';
import { Link } from 'react-router-dom';

export interface CategoryLayoutProps {
    category: CategoryModel;
    articles?: ArticleModel[];
}

export const CategoryLayout: FunctionComponent<CategoryLayoutProps> = memo(({ articles }) => {
    return (
        <PageLayout>
            {articles && articles.map(article => (
                <Card>
                    <div style={{ display: 'flex' }}>
                        <CardMedia
                            style={{ width: 150 }}
                            image={'https://via.placeholder.com/150x150'}
                            title={`Vorschaubild zu ${article.title}`}
                        />
                        <CardContent>
                            <Typography variant="h4" component="h3">
                                <MuiLink>
                                    <Link to={'/article'}>
                                        {article.title}
                                    </Link>
                                </MuiLink>
                            </Typography>
                            <Typography variant={'subtitle1'} color="textSecondary">
                                15.07.2019 &bull; Oskarverleihung &bull; 18 Views &bull; Autor: Lola &bull; Bewertung
                            </Typography>
                            <Typography variant={'subheading'} color="textSecondary">
                                (Füge hier einen kurzen Vorschautext von etwa 30 Wörtern ein)
                            </Typography>
                        </CardContent>
                    </div>
                </Card>
            ))}
        </PageLayout>
    );
});