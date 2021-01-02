import React, { memo } from 'react';
import { makeStyles, } from '@material-ui/core';
import { ArticleModel } from '../../model';
import { ContentModule } from './module/ContentModule';
import { ArticleTitle } from './ArticleTitle';

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
}));

interface ArticleProps {
    article: ArticleModel;
    isEditModeEnabled?: boolean;
    onUpdateArticle?(article: ArticleModel): void;
}

export const Article = memo<ArticleProps>(({ article, isEditModeEnabled, onUpdateArticle }) => {
    const styles = useStyles();

    return (
        <article className={styles.root} data-testid={'Article'}>
            <ArticleTitle article={article} showEditButton={!isEditModeEnabled} />
            <section className={styles.contentModules}>
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
