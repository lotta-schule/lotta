import React, { memo } from 'react';
import { connect } from 'react-redux';
import { UserModel, ArticleModel } from '../../model';
import { State } from '../../store/State';
import { UserArticleBar } from './UserArticleBar';

interface ConnectedUserArticleBarStateProps {
    user: UserModel | null;
}

interface ConnectedUserArticleBarDispatchProps {
}

interface ConnectedUserArticleBarProps {
    article: ArticleModel;
}

export const ConnectedUserArticleBar = connect<ConnectedUserArticleBarStateProps, ConnectedUserArticleBarDispatchProps, ConnectedUserArticleBarProps, State>(
    state => ({
        user: state.user.user
    }),
    {}
)(memo<ConnectedUserArticleBarProps & Partial<ConnectedUserArticleBarStateProps & ConnectedUserArticleBarDispatchProps>>(({ article, user }) => (
    <UserArticleBar user={user!} article={article} />
)));