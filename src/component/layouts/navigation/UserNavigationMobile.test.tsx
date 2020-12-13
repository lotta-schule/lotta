import React from 'react';
import { render } from 'test/util';
import { UserNavigationMobile } from './UserNavigationMobile';
import { GetUnpublishedArticlesQuery } from 'api/query/GetUnpublishedArticles';
import { SomeUser, adminGroup } from 'test/fixtures';

describe('component/layouts/UserNavigationMobile', () => {

    describe('logged out user', () => {
        it('should render a login and logout button', () => {
            const screen = render(
                <UserNavigationMobile />
            );
            expect(screen.queryAllByRole('button')).toHaveLength(3);
            expect(screen.queryByTestId('LoginButton')).not.toBeNull();
            expect(screen.queryByTestId('RegisterButton')).not.toBeNull();
            expect(screen.queryByTestId('SearchButton')).not.toBeNull();

            // admin and profile and messages button should not be visible
            expect(screen.queryByTestId('ProfileButton')).toBeNull();
            expect(screen.queryByTestId('AdminButton')).toBeNull();
            expect(screen.queryByTestId('MessagingButton')).toBeNull();
        });
    });

    describe('non-admin user', () => {
        it('should render profile and createArticle buttons, but not admin buttons', () => {
            const screen = render(
                <UserNavigationMobile />,
                {}, { currentUser: SomeUser, useCache: true }
            );
            expect(screen.queryAllByRole('button')).toHaveLength(7);
            expect(screen.queryByTestId('LoginButton')).toBeNull();
            expect(screen.queryByTestId('RegisterButton')).toBeNull();

            expect(screen.queryByTestId('SearchButton')).toBeVisible();
            expect(screen.queryByTestId('CreateArticleButton')).toBeVisible();
            expect(screen.queryByTestId('OwnArticlesButton')).toBeVisible();
            expect(screen.queryByTestId('ProfileButton')).toBeVisible();
            expect(screen.queryByTestId('ProfileFilesButton')).toBeVisible();
            expect(screen.queryByTestId('MessagingButton')).toBeVisible();

            // admin and profile button should not be visible
            expect(screen.queryByTestId('AdminButton')).toBeNull();
        });
    });

    describe('admin user', () => {
        it('should render profile and createArticle buttons, and also admin buttons', () => {
            const screen = render(
                <UserNavigationMobile />,
                {},
                {
                    currentUser: { ...SomeUser, groups: [adminGroup] },
                    additionalMocks: [{ request: { query: GetUnpublishedArticlesQuery }, result: { data: { articles: [] } } }],
                    useCache: true
                }
            );
            expect(screen.queryAllByRole('button')).toHaveLength(9);
            expect(screen.queryByTestId('LoginButton')).toBeNull();
            expect(screen.queryByTestId('RegisterButton')).toBeNull();

            expect(screen.queryByTestId('SearchButton')).toBeVisible();
            expect(screen.queryByTestId('CreateArticleButton')).toBeVisible();
            expect(screen.queryByTestId('OwnArticlesButton')).toBeVisible();
            expect(screen.queryByTestId('ProfileButton')).toBeVisible();
            expect(screen.queryByTestId('ProfileFilesButton')).toBeVisible();
            expect(screen.queryByTestId('MessagingButton')).toBeVisible();

            expect(screen.queryByTestId('ProfileButton')).toBeVisible();
            expect(screen.queryByTestId('AdminButton')).toBeVisible();
        });
    });
});
