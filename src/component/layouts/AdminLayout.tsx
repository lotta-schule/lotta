import React, { FunctionComponent, memo } from 'react';
import { useSelector } from 'react-redux';
import { UserModel } from 'model';
import { State } from 'store/State';
import useRouter from 'use-react-router';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { Switch, Route } from 'react-router-dom';
import { Navigation } from './adminLayout/Navigation';
import { UserManagement } from './adminLayout/userManagement/UserManagement';
import { CategoriesManagement } from './adminLayout/userManagement/CategoryManagement';
import { ArticlesManagement } from './adminLayout/userManagement/ArticlesManagement';
import { ClientManagement } from './adminLayout/userManagement/ClientManagement';

export const AdminLayout: FunctionComponent = memo(() => {
    const user = useSelector<State, UserModel | null>(s => s.user.user);
    const { history } = useRouter();
    if (!user) {
        history.replace('/');
        return <div></div>;
    }
    return (
        <>
            <BaseLayoutMainContent>
                <Switch>
                    <Route exact path='/admin' component={ClientManagement} />
                    <Route path='/admin/users' component={UserManagement} />
                    <Route path='/admin/articles' component={ArticlesManagement} />
                    <Route path='/admin/categories' component={CategoriesManagement} />
                </Switch>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <Navigation />
            </BaseLayoutSidebar>
        </>
    );
});