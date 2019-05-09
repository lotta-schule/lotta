import React, { memo } from 'react';
import { connect } from 'react-redux';
import { UserModel } from '../../../model';
import { State } from '../../../store/State';
import { UserNavigation } from './UserNavigation';
import { createLoginAction, createLogoutAction } from '../../../store/actions/user';

interface ConnectedUserNavigationStateProps {
    user: UserModel | null;
}

interface ConnectedUserNavigationDispatchProps {
    onLogin(user: UserModel, token: string): void;
    onLogout(): void;
}

export const ConnectedUserNavigation = connect<ConnectedUserNavigationStateProps, ConnectedUserNavigationDispatchProps, {}, State>(
    state => ({
        user: state.user.user
    }),
    {
        onLogin: createLoginAction,
        onLogout: createLogoutAction
    }
)(memo<Partial<ConnectedUserNavigationStateProps & ConnectedUserNavigationDispatchProps>>(({ user, onLogin, onLogout }) => (
    <UserNavigation user={user!} onLogin={onLogin!} onLogout={onLogout!} />
)));