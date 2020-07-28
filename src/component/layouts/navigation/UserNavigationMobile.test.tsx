import React from 'react';
import {
    render,
    cleanup,

} from 'test/util';
import { UserNavigationMobile } from './UserNavigationMobile';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { SomeUser, adminGroup } from 'test/fixtures';

afterEach(cleanup);

describe('component/layouts/UserNavigationMobile', () => {

    describe('logged out user', () => {
        it('should render a login and logout button', () => {
            const { container, queryByTestId } = render(
                <UserNavigationMobile />
            );
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toEqual(3);
            expect(queryByTestId('LoginButton')).not.toBeNull();
            expect(queryByTestId('RegisterButton')).not.toBeNull();
            expect(queryByTestId('SearchButton')).not.toBeNull();

            // admin and profile button should not be visible
            expect(queryByTestId('ProfileButton')).toBeNull();
            expect(queryByTestId('AdminButton')).toBeNull();
        });
    });

    describe('non-admin user', () => {
        it('should render profile and createArticle buttons, but not admin buttons', () => {
            const { container, queryByTestId } = render(
                <UserNavigationMobile />,
                {}, { currentUser: SomeUser, useCache: true }
            );
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toEqual(6);
            expect(queryByTestId('LoginButton')).toBeNull();
            expect(queryByTestId('RegisterButton')).toBeNull();

            expect(queryByTestId('SearchButton')).toBeVisible();
            expect(queryByTestId('CreateArticleButton')).toBeVisible();
            expect(queryByTestId('OwnArticlesButton')).toBeVisible();
            expect(queryByTestId('ProfileButton')).toBeVisible();
            expect(queryByTestId('ProfileFilesButton')).toBeVisible();

            // admin and profile button should not be visible
            expect(queryByTestId('AdminButton')).toBeNull();
        });
    });

    describe('admin user', () => {
        it('should render profile and createArticle buttons, and also admin buttons', () => {
            const { container, queryByTestId } = render(
                <UserNavigationMobile />,
                {},
                {
                    currentUser: { ...SomeUser, groups: [adminGroup] },
                    additionalMocks: [{ request: { query: GetUnpublishedArticlesQuery }, result: { data: { articles: [] } } }],
                    useCache: true
                }
            );
            const buttons = container.querySelectorAll('button');
            expect(buttons.length).toEqual(8);
            expect(queryByTestId('LoginButton')).toBeNull();
            expect(queryByTestId('RegisterButton')).toBeNull();

            expect(queryByTestId('SearchButton')).toBeVisible();
            expect(queryByTestId('CreateArticleButton')).toBeVisible();
            expect(queryByTestId('OwnArticlesButton')).toBeVisible();
            expect(queryByTestId('ProfileButton')).toBeVisible();
            expect(queryByTestId('ProfileFilesButton')).toBeVisible();

            expect(queryByTestId('ProfileButton')).toBeVisible();
            expect(queryByTestId('AdminButton')).toBeVisible();
        });
    });
});
