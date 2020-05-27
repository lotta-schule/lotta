import React from 'react';
import {
    render,
    cleanup,

} from 'test/util';
import { UeberSuedamerika } from 'test/fixtures/Article';
import { ArticleLayout } from './ArticleLayout';

afterEach(cleanup);

describe('component/article/ArticleLayout', () => {

    it('should not render the widgets list', async done => {
        const { queryByTestId } = render(<ArticleLayout articleId={UeberSuedamerika.id} />);
        await new Promise(resolve => setTimeout(resolve));
        expect(queryByTestId).not.toBeNull();
        done();
    });

});