import React, { FunctionComponent, memo } from 'react';
import { ArticleModel } from '../../model';
import { ArticlePreview } from './ArticlePreview';
import { ContentModule } from './module/ContentModule';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        padding: '0.5em',
        backgroundColor: theme.palette.primary.contrastText
    }
}));

interface ArticleProps {
    article: ArticleModel;
    isEditModeEnabled?: boolean;
    onUpdateArticle?(article: ArticleModel): void;
}

export const Article: FunctionComponent<ArticleProps> = memo(({ article, isEditModeEnabled, onUpdateArticle }) => {
    const styles = useStyles();
    return (
        <article className={styles.root} data-testid={'Article'}>
            <ArticlePreview
                article={article}
                disableLink={isEditModeEnabled}
                disableEdit={isEditModeEnabled}
                isEmbedded
            />
            <DragDropContext onDragEnd={({ destination, source }) => {
                if (!destination) {
                    return;
                }

                if (
                    destination.droppableId === source.droppableId &&
                    destination.index === source.index
                ) {
                    return;
                }

                if (onUpdateArticle) {
                    const newModulesArray = Array.from(article.contentModules);
                    newModulesArray.splice(source.index, 1);
                    newModulesArray.splice(destination.index, 0, article.contentModules[source.index]);
                    onUpdateArticle({
                        ...article,
                        contentModules: newModulesArray.map((cm, i) => ({
                            ...cm,
                            sortKey: i * 10
                        }))
                    });
                }
            }}>
                <Droppable droppableId={String(article.id)}>
                    {provided => (
                        <section {...provided.droppableProps} ref={provided.innerRef}>
                            {article.contentModules.sort((cm1, cm2) => cm1.sortKey - cm2.sortKey).map((contentModule, index) => (
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
                            {provided.placeholder}
                        </section>
                    )}
                </Droppable>
            </DragDropContext>
        </article>
    );
});