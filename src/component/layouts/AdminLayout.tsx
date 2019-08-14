import React, { FunctionComponent, memo } from 'react';
import useRouter from 'use-react-router';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { Switch, Route } from 'react-router-dom';
import { Navigation } from './adminLayout/Navigation';
import { UserManagement } from './adminLayout/userManagement/UserManagement';
import { CategoriesManagement } from './adminLayout/userManagement/CategoryManagement';
import { ClientManagement } from './adminLayout/userManagement/ClientManagement';
import { useCurrentUser } from 'util/user/useCurrentUser';

export const AdminLayout: FunctionComponent = memo(() => {
    const currentUser = useCurrentUser();
    const { history } = useRouter();
    if (!currentUser) {
        history.replace('/');
        return <div></div>;
    }
    return (
        <>
            <BaseLayoutMainContent>
                <Switch>
                    <Route exact path='/admin' component={ClientManagement} />
                    <Route path='/admin/users' component={UserManagement} />
                    <Route path='/admin/categories' component={CategoriesManagement} />
                </Switch>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <Navigation />
            </BaseLayoutSidebar>
        </>
    );
});