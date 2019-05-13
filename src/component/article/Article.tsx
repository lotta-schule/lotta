import React, { FunctionComponent, memo } from 'react';
import { ArticleModel } from '../../model';
import { ConnectedUserArticleBar } from './ConnectedUserArticleBar';
import { ArticlePreview } from './ArticlePreview';
import { ContentModule } from './module/ContentModule';

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
        {article.modules.map(contentModule => (
            <ContentModule
                key={contentModule.id}
                module={contentModule}
                isEditModeEnabled={isEditModeEnabled}
                onUpdateModule={updatedModule => {
                    if (onUpdateArticle) {
                        onUpdateArticle({
                            ...article,
                            modules: article.modules.map(module => module.id === updatedModule.id ? updatedModule : module)
                        });
                    }
                }}
            />
        ))}
    </article>
));