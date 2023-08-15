import * as React from 'react';
import { render, waitFor } from 'test/util';
import { TagsSelect } from './TagsSelect';
import { FetchResult } from '@apollo/client';
import userEvent from '@testing-library/user-event';

import GetTagsQuery from 'api/query/GetTagsQuery.graphql';

describe('shared/layouts/editArticleLayouut/TagsSelect', () => {
    const getAdditionalMocks = (fn: () => FetchResult) => [
        {
            request: {
                query: GetTagsQuery,
            },
            result: fn,
        },
    ];

    it('should render a TagsSelect without error', async () => {
        render(<TagsSelect value={[]} onChange={() => {}} />, {}, {});
    });

    it('should show a delete button for tags', async () => {
        const fireEvent = userEvent.setup();
        const fn = jest.fn();
        const screen = render(
            <TagsSelect value={['tag1']} onChange={fn} />,
            {},
            {}
        );
        const tagElement = screen.getByTestId('Tag');
        expect(tagElement.querySelector('button')).toBeVisible();
        await fireEvent.click(tagElement.querySelector('button')!);
        expect(fn).toHaveBeenCalledWith([]);
    });

    it('should show the correct options', async () => {
        const fireEvent = userEvent.setup();
        const resFn = jest.fn(() => ({
            data: { tags: ['tag', 'noch ein tag', 'wieder-tag'] },
        }));
        const screen = render(
            <TagsSelect value={[]} onChange={() => {}} />,
            {},
            { additionalMocks: getAdditionalMocks(resFn) }
        );
        await waitFor(() => {
            expect(resFn).toHaveBeenCalled();
        });
        await fireEvent.click(
            screen.getByRole('button', { name: /vorschläge anzeigen/i })
        );
        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeVisible();
        });
        expect(
            screen.queryAllByRole('option').map((o) => o.textContent)
        ).toEqual(['tag', 'noch ein tag', 'wieder-tag']);
    });

    it('should call onChange with the selected tag', async () => {
        const fireEvent = userEvent.setup();
        const resFn = jest.fn(() => ({
            data: { tags: ['tag', 'noch ein tag', 'wieder-tag'] },
        }));
        const onChangeFn = jest.fn();
        const screen = render(
            <TagsSelect value={[]} onChange={onChangeFn} />,
            {},
            { additionalMocks: getAdditionalMocks(resFn) }
        );
        await waitFor(() => {
            expect(resFn).toHaveBeenCalled();
        });
        await fireEvent.click(
            screen.getByRole('button', { name: /vorschläge anzeigen/i })
        );
        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeVisible();
        });
        await fireEvent.click(
            screen.getByRole('option', { name: /noch ein tag/i })
        );
        expect(onChangeFn).toHaveBeenCalledWith(['noch ein tag']);
    });

    it('should deselect an already selected tag', async () => {
        const fireEvent = userEvent.setup();
        const resFn = jest.fn(() => ({
            data: { tags: ['tag', 'noch ein tag', 'wieder-tag'] },
        }));
        const onChangeFn = jest.fn();
        const screen = render(
            <TagsSelect
                value={['tag', 'noch ein tag']}
                onChange={onChangeFn}
            />,
            {},
            { additionalMocks: getAdditionalMocks(resFn) }
        );
        await waitFor(() => {
            expect(resFn).toHaveBeenCalled();
        });
        await new Promise((resolve) => setTimeout(resolve, 50));
        await fireEvent.click(
            screen.getByRole('button', { name: /vorschläge anzeigen/i })
        );
        await waitFor(() => {
            expect(screen.getByRole('listbox')).toBeVisible();
        });
        await fireEvent.click(
            screen.getByRole('option', { name: /noch ein tag/i })
        );
        expect(onChangeFn).toHaveBeenCalledWith(['tag']);
    });
});
