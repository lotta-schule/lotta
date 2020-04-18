import React, { memo } from 'react';
import { ArticleModel } from '../../model';
import { ArticlePreviewStandardLayout } from './ArticlePreviewStandardLayout';
import { ContentModule } from './module/ContentModule';
import { makeStyles } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';

const useStyles = makeStyles(theme => ({
    root: {
        padding: '0.5em',
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: `1px 1px 2px ${fade(theme.palette.text.primary, .2)}`,
    }
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
            <ArticlePreviewStandardLayout
                article={article}
                disableLink={isEditModeEnabled}
                disableEdit={isEditModeEnabled}
                isEmbedded
            />
            <section>
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