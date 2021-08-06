import * as React from 'react';
import { ArticleModel } from '../../model';
import { ContentModule } from './module/ContentModule';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { makeStyles, CircularProgress } from '@material-ui/core';
import { fade } from '@material-ui/core/styles/colorManipulator';
import { ArticleTitle } from './ArticleTitle';

const useStyles = makeStyles((theme) => ({
    root: {
        padding: '0.5em',
        backgroundColor: theme.palette.background.paper,
        borderRadius: theme.shape.borderRadius,
        boxShadow: `1px 1px 2px ${fade(theme.palette.text.primary, 0.2)}`,
    },
    contentModules: {
        marginTop: theme.spacing(1),
        backgroundColor: theme.palette.background.paper,
    },
}));

interface ArticleEditableProps {
    article: ArticleModel;
    onUpdateArticle: (article: ArticleModel) => void;
}

export const ArticleEditable = React.memo<ArticleEditableProps>(
    ({ article, onUpdateArticle }) => {
        const styles = useStyles();
        return (
            <article className={styles.root} data-testid={'ArticleEditable'}>
                <ArticleTitle article={article} onUpdate={onUpdateArticle} />
                <section className={styles.contentModules}>
                    <React.Suspense fallback={<CircularProgress />}>
                        <DragDropContext
                            onDragEnd={({
                                draggableId,
                                destination,
                                source,
                            }) => {
                                if (!destination) {
                                    return;
                                }

                                if (
                                    destination.droppableId ===
                                        source.droppableId &&
                                    destination.index === source.index
                                ) {
                                    return;
                                }

                                onUpdateArticle({
                                    ...article,
                                    contentModules: Array.from(
                                        article.contentModules
                                    )
                                        .map((contentModule) => {
                                            if (
                                                contentModule.id.toString() ===
                                                draggableId
                                            ) {
                                                return {
                                                    ...contentModule,
                                                    sortKey:
                                                        destination.index * 10 +
                                                        (destination.index >
                                                        source.index
                                                            ? 1
                                                            : -1),
                                                };
                                            } else {
                                                return contentModule;
                                            }
                                        })
                                        .sort(
                                            (cm1, cm2) =>
                                                cm1.sortKey - cm2.sortKey
                                        )
                                        .map((cm, i) => ({
                                            ...cm,
                                            sortKey: i * 10,
                                        })),
                                });
                            }}
                        >
                            <Droppable droppableId={String(article.id)}>
                                {(provided) => (
                                    <section
                                        {...provided.droppableProps}
                                        ref={provided.innerRef}
                                    >
                                        {[...article.contentModules]
                                            .sort(
                                                (cm1, cm2) =>
                                                    cm1.sortKey - cm2.sortKey
                                            )
                                            .map((contentModule, index) => (
                                                <Draggable
                                                    key={contentModule.id}
                                                    draggableId={String(
                                                        contentModule.id
                                                    )}
                                                    index={index}
                                                >
                                                    {(
                                                        {
                                                            draggableProps,
                                                            dragHandleProps,
                                                            innerRef,
                                                        },
                                                        snapshot
                                                    ) => (
                                                        <ContentModule
                                                            index={index}
                                                            contentModule={
                                                                contentModule
                                                            }
                                                            isEditModeEnabled
                                                            cardProps={{
                                                                innerRef,
                                                                ...draggableProps,
                                                            }}
                                                            dragbarProps={
                                                                dragHandleProps
                                                            }
                                                            isDragging={
                                                                snapshot.isDragging
                                                            }
                                                            onUpdateModule={(
                                                                updatedModule
                                                            ) => {
                                                                onUpdateArticle(
                                                                    {
                                                                        ...article,
                                                                        contentModules: article.contentModules.map(
                                                                            (
                                                                                contentModule
                                                                            ) =>
                                                                                contentModule.id ===
                                                                                updatedModule.id
                                                                                    ? updatedModule
                                                                                    : contentModule
                                                                        ),
                                                                    }
                                                                );
                                                            }}
                                                            onRemoveContentModule={() =>
                                                                onUpdateArticle(
                                                                    {
                                                                        ...article,
                                                                        contentModules: article.contentModules.filter(
                                                                            (
                                                                                currentModule
                                                                            ) =>
                                                                                contentModule.id !==
                                                                                currentModule.id
                                                                        ),
                                                                    }
                                                                )
                                                            }
                                                        />
                                                    )}
                                                </Draggable>
                                            ))}
                                        {provided.placeholder}
                                    </section>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </React.Suspense>
                </section>
            </article>
        );
    }
);
