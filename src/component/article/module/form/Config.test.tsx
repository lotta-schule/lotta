import React from 'react';
import userEvent from '@testing-library/user-event';
import { render } from 'test/util';
import { ContentModuleModel, ContentModuleType } from 'model';
import { Config } from './Config';

describe('component/article/module/form/Config', () => {
    const form: ContentModuleModel = {
        id: "31415",
        type: ContentModuleType.FORM,
        files: [],
        sortKey: 0
    };

    it('should render the component', () => {
        render(
            <Config contentModule={form} onUpdateModule={() => {}} onRequestClose={() => {}} />
        );
    });

    it('should show the "See data" button and open the dialog when clicked', () => {
        const screen = render(
            <Config contentModule={form} onUpdateModule={() => {}} onRequestClose={() => {}} />
        );
        expect(screen.getByRole('button', { name: /daten/i })).toBeVisible();
        userEvent.click(screen.getByRole('button', { name: /daten/i }));
        expect(screen.getByRole('presentation')).toBeVisible();
    });
});
