import * as React from 'react';
import userEvent from '@testing-library/user-event';
import { render, waitFor } from 'test/util';
import { ContentModuleModel, ContentModuleType } from 'model';
import { Config } from './Config';

describe('shared/article/module/form/Config', () => {
    const form: ContentModuleModel = {
        id: '31415',
        type: ContentModuleType.FORM,
        files: [],
        sortKey: 0,
    };

    it('should render the shared', () => {
        render(
            <Config
                contentModule={form}
                onUpdateModule={() => {}}
                onRequestClose={() => {}}
            />
        );
    });

    it('should show the "See data" button and open the dialog when clicked', async () => {
        const screen = render(
            <Config
                contentModule={form}
                onUpdateModule={() => {}}
                onRequestClose={() => {}}
            />
        );
        expect(screen.getByRole('button', { name: /daten/i })).toBeVisible();
        userEvent.click(screen.getByRole('button', { name: /daten/i }));
        await waitFor(() => {
            expect(screen.getByRole('dialog')).toBeVisible();
        });
    });
});
