import React, { memo, useEffect } from 'react';
import { Typography } from '@material-ui/core';
import { BaseLayoutMainContent } from '../BaseLayoutMainContent';
import { BaseLayoutSidebar } from '../BaseLayoutSidebar';
import { Switch, Redirect, Route } from 'react-router-dom';
import { AdminLayoutNavigation } from './AdminLayoutNavigation';
import { UserManagement } from './userManagement/UserManagement';
import { UnpublishedArticles } from '../profileLayout/UnpublishedArticles';
import { CategoryManagement } from './categoryManagment/CategoryManagement';
import { SystemManagement } from './systemManagment/SystemManagement';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { WidgetsList } from '../WidgetsList';
import { Header } from '../../general/Header';
import { User } from 'util/model';
import useRouter from 'use-react-router';
import bannerAdmin from './bannerAdmin.png';

export const AdminLayout = memo(() => {
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();
    useEffect(() => {
        if (!User.isAdmin(currentUser)) {
            history.replace('/');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser]);

    if (!User.isAdmin(currentUser)) {
        return <div />;
    }

    return (
        <>
            <BaseLayoutMainContent>
                <Header bannerImageUrl={bannerAdmin}>
                    <Typography variant={'h2'} data-testid="title">
                        Administration
                    </Typography>
                </Header>
                <Switch>
                    <Route exact path='/admin'>
                        <Redirect to={'/admin/system/general'} />
                    </Route>
                    <Route path={'/admin/system'} component={SystemManagement} />
                    <Route path={'/admin/categories'} component={CategoryManagement} />
                    <Route path={'/admin/users'} component={UserManagement} />
                    <Route path={'/admin/unpublished'} component={UnpublishedArticles} />
                </Switch>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <WidgetsList widgets={[]}>
                    <AdminLayoutNavigation />
                </WidgetsList>
            </BaseLayoutSidebar>
        </>
    );
});
export default AdminLayout;
