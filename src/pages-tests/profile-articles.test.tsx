import * as React from 'react';
import { render } from 'test/util';
import {
    ComputerExperten,
    VivaLaRevolucion,
    Schulfest,
    Weihnachtsmarkt,
    Klausurenplan,
} from 'test/fixtures';
import { Articles } from '../pages/profile/articles';

describe('pages/profiles/articles', () => {
    it('should render a ProfileArticles without error', async () => {
        const articles = [
            Weihnachtsmarkt,
            Klausurenplan,
            Schulfest,
            VivaLaRevolucion,
            ComputerExperten,
        ];
        render(
            <Articles articles={articles} loadArticlesError={null} />,
            {},
            {}
        );
    });
});
