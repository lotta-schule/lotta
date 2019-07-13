import React, { FunctionComponent, memo } from 'react';
import { ArticleModel, UserModel } from '../../model';
import { Card, CardMedia, CardContent, Typography, Link, Grid, Fab } from '@material-ui/core';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { CollisionLink } from '../general/CollisionLink';
import { Edit } from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { State } from 'store/State';


interface ArticlePreviewProps {
    article: ArticleModel;
}

export const ArticlePreview: FunctionComponent<ArticlePreviewProps> = memo(({ article }) => {

    const user = useSelector<State, UserModel | null>(s => s.user.user);

    return (
        <Card key={article.id} style={{ padding: '0.5em', borderRadius: '0' }}>
            <Grid container style={{ display: 'flex' }}>
                <Grid item xs={12} sm={4}>
                    <CardMedia
                        style={{ minHeight: 180, width: '100%', height: '100%', flexShrink: 0, flexGrow: 0, backgroundPosition: '0 0' }}
                        image={article.previewImageUrl}
                        title={`Vorschaubild zu ${article.title}`}
                    />
                </Grid>
                <Grid item xs>
                    <CardContent>
                        <Typography component={'h4'} variant={'h4'} gutterBottom>
                            <Link component={CollisionLink} color='inherit' underline='none' to={article.pageName ? `/page/${article.pageName}` : `/article/${article.id}`}>
                                {article.title}
                            </Link>
                            {user/* && user.group > UserGroup.GUEST*/ && (
                                <Fab 
                                    color="secondary" 
                                    aria-label="Edit" 
                                    size="small" 
                                    style={{float: 'right'}}
                                    component={CollisionLink}
                                    to={`/article/${article.id}/edit`}
                                >
                                    <Edit />
                                </Fab>)}
                        </Typography>
                        <Typography variant={'subtitle1'} style={{ textTransform: 'uppercase', fontSize: '0.8rem' }}>
                            {format(parseISO(article.updatedAt), 'PPP', { locale: de }) + ' '}
                            {article.pageName && <> &bull; {article.pageName} </>}
                            &bull; 18 Views
                            &bull; Autor: Lola
                            &bull; Bewertung
                        </Typography>
                        <Typography variant={'subtitle1'} color="textSecondary">
                            {article.preview}
                        </Typography>
                    </CardContent>
                </Grid>
            </Grid>
        </Card>
    );
});