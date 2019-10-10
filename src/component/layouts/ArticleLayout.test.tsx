import React from 'react';
import {
    render,
    cleanup,

} from 'test/util';
import { UeberSuedamerika } from 'test/fixtures/Article';
import { ArticleLayout } from './ArticleLayout';

afterEach(cleanup);

describe('component/article/ArticleLayout', () => {

    it('should render the widgets list', async done => {
        const { getByTestId } = render(<ArticleLayout articleId={UeberSuedamerika.id} />);
        await new Promise(resolve => setTimeout(resolve));
        getByTestId('WidgetsList');
        done();
    });

});