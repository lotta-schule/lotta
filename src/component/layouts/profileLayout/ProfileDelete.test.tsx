import React from 'react';
import { render } from 'test/util';
import { SomeUser } from 'test/fixtures';
import { ProfileDelete } from './ProfileDelete';
import { GetOwnArticlesQuery } from 'api/query/GetOwnArticles';
import { ComputerExperten, VivaLaRevolucion, Schulfest, Weihnachtsmarkt, Klausurenplan } from 'test/fixtures';

describe('component/layouts/profileLayout/ProfileDelete', () => {

    it('should render the component', () => {
        render(
            <ProfileDelete />,
            {},
            {
                currentUser: SomeUser,
                useCache: true,
                additionalMocks: [
                    {
                        request: { query: GetOwnArticlesQuery },
                        newData: () => ({
                            data: {
                                articles: [
                                    Weihnachtsmarkt,
                                    Klausurenplan,
                                    Schulfest,
                                    VivaLaRevolucion,
                                    ComputerExperten
                                ]
                            }
                        })
                    }
                ]
            }
        );

    });

});
