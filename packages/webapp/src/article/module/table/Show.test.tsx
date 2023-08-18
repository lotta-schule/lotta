import React from 'react';
import { render } from 'test/util';
import { LehrerListe } from 'test/fixtures';
import { Show } from './Show';

const tableContentModule = LehrerListe.contentModules[0];

describe('shared/article/module/table/Show', () => {
    it('should render without an error', () => {
        render(<Show contentModule={tableContentModule} />);
    });

    describe('render the table', () => {
        it('should render the table with correct content', () => {
            const screen = render(<Show contentModule={tableContentModule} />);
            expect(screen.getByRole('table')).toBeInTheDocument();
            expect(screen.getAllByRole('row')).toHaveLength(7);
            expect(screen.getAllByRole('cell')).toHaveLength(14);
        });
    });
});
