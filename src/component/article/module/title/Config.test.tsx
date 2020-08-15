import React from 'react';
import { render, waitFor } from 'test/util';
import { Klausurenplan } from 'test/fixtures';
import { Config } from './Config';
import userEvent from '@testing-library/user-event';

const titleContentModule = Klausurenplan.contentModules[0];

describe('component/article/module/title/Config', () => {

    it('should render without an error', () => {
        render(<Config contentModule={titleContentModule} onUpdateModule={() => {}} onRequestClose={() => {}} />);
    });

    it('should render a select field with 3 size options', async done => {
        const screen = render(
            <Config contentModule={titleContentModule} onUpdateModule={() => {}} onRequestClose={() => {}} />
        );

        const selectButton = screen.getByRole('button', { name: /groß/i });
        await userEvent.click(selectButton);
        expect(screen.queryAllByRole('option')).toHaveLength(3);
        done();
    });

    it('should show the selected option', async () => {
        const contentModule = {
            ...titleContentModule,
            configuration: {
                level: 6
            }
        };
        const screen = render(
            <Config contentModule={contentModule} onUpdateModule={() => {}} onRequestClose={() => {}} />
        );

        expect(screen.getByRole('button', { name: /klein/i })).toBeInTheDocument();
    });

    it('should change the size configuration', async done => {
        const callback = jest.fn(cm => {
            expect(cm.configuration.level).toEqual(6);
        });
        const screen = render(
            <Config contentModule={titleContentModule} onUpdateModule={callback} onRequestClose={() => {}} />
        );

        const selectButton = screen.getByRole('button', { name: /groß/i });
        await userEvent.click(selectButton);
        await userEvent.click(screen.getByRole('option', { name: /klein/i }));
        await waitFor(() => {
            expect(callback).toHaveBeenCalled();
        });
        done();
    });
});
