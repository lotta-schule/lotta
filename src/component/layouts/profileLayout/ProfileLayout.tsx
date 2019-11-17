import React, { memo, useEffect } from 'react';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { BaseLayoutSidebar } from '../BaseLayoutSidebar';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import { Route, Switch } from 'react-router-dom';
import { ProfileData } from './ProfileData';
import { WidgetsList } from '../WidgetsList';
import { ProfileLayoutNavigation } from './ProfileLayoutNavigation';
import { ProfileMediaFiles } from './ProfileMediaFiles';
import { ProfileArticles } from './ProfileArticles';
import { UnpublishedArticles } from './UnpublishedArticles';
import useRouter from 'use-react-router';

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
        <>
            <BaseLayoutMainContent>
                <Switch>
                    <Route exact path='/profile' component={ProfileData} />
                    <Route path='/profile/files' component={ProfileMediaFiles} />
                    <Route path='/profile/articles' component={ProfileArticles} />
                    {User.isAdmin(currentUser) && (
                        <Route path='/profile/unpublished' component={UnpublishedArticles} />
                    )}
                </Switch>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <WidgetsList widgets={[]}>
                    <ProfileLayoutNavigation />
                </WidgetsList>
            </BaseLayoutSidebar>
        </>
    );
});