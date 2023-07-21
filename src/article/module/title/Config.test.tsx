import React from 'react';
import { render, waitFor } from 'test/util';
import { Klausurenplan } from 'test/fixtures';
import { Config } from './Config';
import userEvent from '@testing-library/user-event';

const titleContentModule = Klausurenplan.contentModules[0];

describe('shared/article/module/title/Config', () => {
    it('should render without an error', () => {
        render(
            <Config
                contentModule={titleContentModule}
                onUpdateModule={() => {}}
                onRequestClose={() => {}}
            />
        );
    });

    it('should render a select field with 3 size options', () => {
        const screen = render(
            <Config
                contentModule={titleContentModule}
                onUpdateModule={() => {}}
                onRequestClose={() => {}}
            />
        );

        expect(screen.getByRole('combobox')).toHaveValue('4');
        expect(screen.queryAllByRole('option')).toHaveLength(3);
    });

    it('should show the selected option', () => {
        const contentModule = {
            ...titleContentModule,
            configuration: {
                level: 6,
            },
        };
        const screen = render(
            <Config
                contentModule={contentModule}
                onUpdateModule={() => {}}
                onRequestClose={() => {}}
            />
        );

        expect(
            screen.getByRole('option', { name: /klein/i, selected: true })
        ).toBeInTheDocument();
    });

    it('should change the size configuration', async () => {
        const fireEvent = userEvent.setup();
        const callback = jest.fn((cm) => {
            expect(cm.configuration.level).toEqual(6);
        });
        const screen = render(
            <Config
                contentModule={titleContentModule}
                onUpdateModule={callback}
                onRequestClose={() => {}}
            />
        );

        await fireEvent.selectOptions(
            screen.getByRole('combobox'),
            'Überschrift klein'
        );
        await waitFor(() => {
            expect(callback).toHaveBeenCalled();
        });
    });
});
