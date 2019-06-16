import React, { FunctionComponent, memo } from 'react';
import { ArticleModel } from '../../model';
import { ConnectedUserArticleBar } from './ConnectedUserArticleBar';
import { ArticlePreview } from './ArticlePreview';
import { ContentModule } from './module/ContentModule';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

interface ArticleProps {
    article: ArticleModel;
    isEditModeEnabled?: boolean;
    onUpdateArticle?(article: ArticleModel): void;
}

export const Article: FunctionComponent<ArticleProps> = memo(({ article, isEditModeEnabled, onUpdateArticle }) => (
    <article>
        <ArticlePreview article={article} />
        {!isEditModeEnabled && (
            <ConnectedUserArticleBar article={article} />
        )}
        <DragDropContext onDragEnd={({ destination, source, draggableId }) => {
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
                    contentModules: newModulesArray
                });
            }
        }}>
            <Droppable droppableId={article.id}>
                {provided => (
                    <section {...provided.droppableProps} ref={provided.innerRef}>
                        {article.contentModules.map((contentModule, index) => (
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
                            />
                        ))}
                        {provided.placeholder}
                    </section>
                )}
            </Droppable>
        </DragDropContext>
    </article>
));