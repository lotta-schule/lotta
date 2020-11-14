import React from 'react';
import { render, cleanup, waitFor } from 'test/util';
import { ComputerExperten, VivaLaRevolucion, Schulfest, Weihnachtsmarkt, Klausurenplan } from 'test/fixtures';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { ProfileArticles } from './ProfileArticles';

afterEach(cleanup);

describe('component/profile/ProfileArticles', () => {

    it('should render a ProfileArticles without error', async () => {
        let didSendResponse = false;
        render(
            <ProfileArticles />,
            {  }, {
            additionalMocks: [{
                request: { query: GetOwnArticlesQuery },
                result: () => {
                    didSendResponse = true;
                    return {
                        data: {
                            articles: [
                                Weihnachtsmarkt,
                                Klausurenplan,
                                Schulfest,
                                VivaLaRevolucion,
                                ComputerExperten
                            ]
                        }
                    };
                }
            }]
        });
        await waitFor(() => {
            expect(didSendResponse).toEqual(true);
        });
    });

});
