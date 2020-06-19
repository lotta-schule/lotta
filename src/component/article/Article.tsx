import React, { memo } from 'react';
import { makeStyles, Divider, Grid, Typography, Fab } from '@material-ui/core';
import { Edit, Place } from '@material-ui/icons';
import { ArticleModel, ID } from '../../model';
import { ContentModule } from './module/ContentModule';
import { ArticleTitle } from './ArticleTitle';
import { Article as ArticleUtil, User } from 'util/model';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { CollisionLink } from 'component/general/CollisionLink';
import { useMutation } from '@apollo/client';
import { ToggleArticlePinMutation } from 'api/mutation/ToggleArticlePin';
import clsx from 'clsx';

const useStyles = makeStyles(theme => ({
    root: {
    },
    contentModules: {
        backgroundColor: theme.palette.background.paper,
    },
    previewSection: {
        padding: theme.spacing(1),
        color: theme.palette.grey[600]
    },
    buttonSection: {
        padding: theme.spacing(.5),
        textAlign: 'right',
    },
    editButton: {
        color: theme.palette.background.paper
    },
    pinButton: {
        margin: theme.spacing(1, 0, 0, 1),
        color: theme.palette.background.paper,
        '&.active': {
            color: theme.palette.text.primary
        }
    }
}));

interface ArticleProps {
    article: ArticleModel;
    isEditModeEnabled?: boolean;
    onUpdateArticle?(article: ArticleModel): void;
}

export const Article = memo<ArticleProps>(({ article, isEditModeEnabled, onUpdateArticle }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();

    const [toggleArticlePin] = useMutation<{ article: ArticleModel }, { id: ID }>(ToggleArticlePinMutation, {
        variables: { id: article.id }
    });

    const showEditSection = (User.canEditArticle(currentUser, article) || User.isAdmin(currentUser));

    return (
        <article className={styles.root} data-testid={'Article'}>
            <ArticleTitle article={article} />
            <section className={styles.contentModules}>
                {(article.preview || showEditSection) && (
                    <section className={styles.previewSection}>
                        <Grid container>
                            <Grid item xs>
                                <Typography variant={'subtitle2'}>
                                    {article.preview}
                                </Typography>
                            </Grid>
                            {showEditSection && (
                                <Grid item xs={2} sm={2} className={styles.buttonSection}>
                                    {User.canEditArticle(currentUser, article) && (
                                        <Fab
                                            aria-label="Edit"
                                            size="small"
                                            className={clsx(styles.editButton, 'edit-button')}
                                            component={CollisionLink}
                                            to={ArticleUtil.getPath(article, { edit: true })}
                                        >
                                            <Edit />
                                        </Fab>
                                    )}
                                    {User.isAdmin(currentUser) && (
                                        <Fab
                                            aria-label="Pin"
                                            size="small"
                                            className={clsx(styles.pinButton, { active: article.isPinnedToTop })}
                                            onClick={() => toggleArticlePin()}
                                        >
                                            <Place />
                                        </Fab>
                                    )}
                                </Grid>
                            )}
                        </Grid>
                        <Divider />
                    </section>
                )}
                {[...article.contentModules].sort((cm1, cm2) => cm1.sortKey - cm2.sortKey).map((contentModule, index) => (
                    <ContentModule
                        key={contentModule.id}
                        index={index}
                        contentModule={contentModule}
                        isEditModeEnabled={isEditModeEnabled}
                        onUpdateModule={updatedModule => {
                            if (onUpdateArticle) {
                                onUpdateArticle({
                                    ...article,
                                    contentModules: article.contentModules.map(contentModule =>
                                        contentModule.id === updatedModule.id ?
                                            updatedModule :
                                            contentModule
                                    )
                                });
                            }
                        }}
                        onRemoveContentModule={() => onUpdateArticle && onUpdateArticle({
                            ...article,
                            contentModules: article.contentModules.filter(currentModule => contentModule.id !== currentModule.id)
                        })}
                    />
                ))}
            </section>
        </article>
    );
});