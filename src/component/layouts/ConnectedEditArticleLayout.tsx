import React, { memo } from 'react';
import { connect } from 'react-redux';
import { ArticleModel } from '../../model';
import { State } from '../../store/State';
import { EditArticleLayout } from './EditArticleLayout';
import { createUpdateArticleAction } from '../../store/actions/content';

interface ConnectedEditArticleLayoutStateProps {
    article?: ArticleModel;
}

interface ConnectedEditArticleLayoutDispatchProps {
    onUpdateArticle(article: ArticleModel): void;
}

interface ConnectedEditArticleLayoutProps {
    articleId: string;
}

export const ConnectedEditArticleLayout = connect<ConnectedEditArticleLayoutStateProps, ConnectedEditArticleLayoutDispatchProps, ConnectedEditArticleLayoutProps, State>(
    (state, ownProps) => ({
        article: state.content.articles.find(article => article.id === ownProps.articleId)
    }),
    {
        onUpdateArticle: createUpdateArticleAction
    }
)(memo<ConnectedEditArticleLayoutProps & Partial<ConnectedEditArticleLayoutStateProps & ConnectedEditArticleLayoutDispatchProps>>(({ article, onUpdateArticle }) => (
    article ?
        <EditArticleLayout article={article} onUpdateArticle={onUpdateArticle} /> :
        <h1>Artikel nicht gefunden</h1>
)));