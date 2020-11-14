import * as React from 'react';
import { render } from 'test/util';
import { SomeUser, Weihnachtsmarkt } from 'test/fixtures';
import { EditArticleLayout } from './EditArticleLayout';

describe('component/layouts/editArticleLayout/EditArticleLayout', () => {

    const mocks: any[] = [
        // {
        //     request: { query: GetUserQuery, variables: { id: KeinErSieEsUser.id } },
        //     result: { data: { searchUsers: KeinErSieEsUser } }
        // }
    ];

    it('should render the EditArticleLayout without error', () => {
        render(
            <EditArticleLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
        );
    });

    it('should show the article', () => {
        const screen = render(
            <EditArticleLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
        );
        expect(screen.getByTestId('ArticleEditable')).toBeVisible();
    });

    it('should show the "add module" bar', () => {
        const screen = render(
            <EditArticleLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
        );
        expect(screen.getByTestId('AddModuleBar')).toBeVisible();
    });

    it('should show the editing sidebar', () => {
        const screen = render(
            <EditArticleLayout article={Weihnachtsmarkt} />,
            {},
            { currentUser: SomeUser, additionalMocks: mocks, useCache: true }
        );
        expect(screen.getByTestId('EditArticleSidebar')).toBeVisible();
    });

    // TODO: Test adding modules
    //
    // TODO: Test saving contentmodules (omit id for - | serialize configuration+content)

});
