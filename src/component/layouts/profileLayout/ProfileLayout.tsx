import React, { memo, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import { Route, Switch } from 'react-router-dom';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { ProfileData } from './ProfileData';
import { ProfileMediaFiles } from './ProfileMediaFiles';
import { ProfileArticles } from './ProfileArticles';
import { Header } from '../../general/Header';
import useRouter from 'use-react-router';
import bannerProfil from './bannerProfil.png';

export const ProfileLayout = memo(() => {
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();

    useEffect(() => {
        if (!currentUser) {
            history.replace('/');
        }
    }, [currentUser, history]);

    if (!currentUser) {
        return (<div></div>);
    }

    return (
        <BaseLayoutMainContent>
            <Header bannerImageUrl={bannerProfil}>
                <Typography variant={'h2'} data-testid="title">Profil</Typography>
            </Header>
            <Switch>
                <Route exact path='/profile' component={ProfileData} />
                <Route path='/profile/files' component={ProfileMediaFiles} />
                <Route path='/profile/articles' component={ProfileArticles} />
            </Switch>
        </BaseLayoutMainContent>
    );
});
export default ProfileLayout;
