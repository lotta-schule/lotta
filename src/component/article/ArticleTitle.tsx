import React, { memo } from 'react';
import { Typography, makeStyles, Theme, Grid } from '@material-ui/core';
import { ArticleModel } from 'model';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { AuthorAvatarsList } from './AuthorAvatarsList';
import { Header } from 'component/general/Header';

export interface ArticleTitleProps {
    article: ArticleModel;
}

const useStyles = makeStyles<Theme>(theme => ({
    outerGrid: {
        height: '100%'
    },
    previewImage: {
        height: '100%',
        width: 'auto'
    },
    mainSection: {
        paddingLeft: theme.spacing(2)
    },
    title: {
        fontSize: '1.6rem'
    },
}));

export const ArticleTitle = memo<ArticleTitleProps>(({ article }) => {
    const styles = useStyles();
    return (
        <Header>
            <Grid container className={styles.outerGrid}>
                {article.previewImageFile && (
                    <img
                        className={styles.previewImage}
                        src={`https://afdptjdxen.cloudimg.io/cover/320x240/foil1/${article.previewImageFile.remoteLocation}`}
                        alt={`Vorschaubild zu ${article.title}`}
                    />
                )}
                <Grid item xs className={styles.mainSection}>
                    <Typography component={'h2'} variant={'h2'} gutterBottom className={styles.title}>
                        {article.title}
                    </Typography>
                    <Typography component={'div'} variant={'subtitle1'}>
                        <>&nbsp;<AuthorAvatarsList users={article.users} />&nbsp;</>
                        {format(new Date(article.updatedAt), 'P', { locale: de }) + ' '}
                        {article.topic && <>| {article.topic}&nbsp;</>}
                    </Typography>
                </Grid>
            </Grid>
        </Header>
    )
});
