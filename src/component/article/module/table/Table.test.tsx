import React from 'react';
import { render } from 'test/util';
import { LehrerListe } from 'test/fixtures';
import { Table } from './Table';

const tableContentModule = LehrerListe.contentModules[0];

describe('component/article/module/table/Table', () => {

    it('should render the edit mode when editModeEnabled is given', () => {
        const screen = render(<Table isEditModeEnabled contentModule={tableContentModule} onUpdateModule={() => {}} />);
        expect(screen.queryByRole('button', { name: /zeile hinzufügen/i })).toBeInTheDocument();
    });

    it('should render the show mode when editModeEnabled is not given', () => {
        const screen = render(<Table contentModule={tableContentModule} onUpdateModule={() => {}} />);
        expect(screen.queryByRole('button', { name: /zeile hinzufügen/i })).not.toBeInTheDocument();
    });

});
