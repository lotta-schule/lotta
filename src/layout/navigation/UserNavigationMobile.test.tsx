import React from 'react';
import { render } from 'test/util';
import { UserNavigationMobile } from './UserNavigationMobile';
import { SomeUser, adminGroup } from 'test/fixtures';
import GetUnpublishedArticlesQuery from 'api/query/GetUnpublishedArticles.graphql';

describe('shared/layouts/UserNavigationMobile', () => {
    describe('logged out userAvatar', () => {
        it('should render a login and logout button', () => {
            const screen = render(<UserNavigationMobile />);
            expect(screen.queryAllByRole('button')).toHaveLength(3);
            expect(screen.queryByTestId('LoginButton')).not.toBeNull();
            expect(screen.queryByTestId('RegisterButton')).not.toBeNull();
            expect(screen.queryByTestId('SearchButton')).not.toBeNull();

            // admin and articlesList and messages button should not be visible
            expect(screen.queryByTestId('ProfileButton')).toBeNull();
            expect(screen.queryByTestId('AdminButton')).toBeNull();
            expect(screen.queryByTestId('MessagingButton')).toBeNull();
        });
    });

    describe('non-admin userAvatar', () => {
        it('should render articlesList and createArticle buttons, but not admin buttons', () => {
            const screen = render(
                <UserNavigationMobile />,
                {},
                { currentUser: SomeUser }
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

            // admin and articlesList button should not be visible
            expect(screen.queryByTestId('AdminButton')).toBeNull();
        });
    });

    describe('admin userAvatar', () => {
        it('should render articlesList and createArticle buttons, and also admin buttons', () => {
            const screen = render(
                <UserNavigationMobile />,
                {},
                {
                    currentUser: { ...SomeUser, groups: [adminGroup] },
                    additionalMocks: [
                        {
                            request: { query: GetUnpublishedArticlesQuery },
                            result: { data: { articles: [] } },
                        },
                    ],
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
