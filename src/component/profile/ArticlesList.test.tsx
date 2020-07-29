import React from 'react';
import { render, cleanup } from 'test/util';
import { ComputerExperten, VivaLaRevolucion, Schulfest, Weihnachtsmarkt, Klausurenplan, imageFile } from 'test/fixtures';
import { ArticlesList } from './ArticlesList';

afterEach(cleanup);

describe('component/profile/ArticlesList', () => {

    const allArticles = [Weihnachtsmarkt, Klausurenplan, Schulfest, VivaLaRevolucion, ComputerExperten];

    it('should render an ArticlesList without error', () => {
        render(
            <ArticlesList articles={allArticles} />,
            {}
        );
    });

    it('should sort the articles by date', async done => {
        const screen = render(
            <ArticlesList articles={allArticles} />,
            {}
        );
        const links = await screen.findAllByRole('link');
        expect(Array.from(links).map(link => link.textContent)).toEqual(['Weihnachtsmarkt', 'Klausurenplan', 'Schulfest', 'Viva La Revolucion', 'Computerexperten']);
        done();
    });

    it('should show the article\'s preview image if one is available', () => {
        const screen = render(
            <ArticlesList articles={[{ ...Weihnachtsmarkt, previewImageFile: (imageFile as any)}]} />,
            {}
        );

        expect(screen.getByRole('img')).toBeVisible();
    });

});
