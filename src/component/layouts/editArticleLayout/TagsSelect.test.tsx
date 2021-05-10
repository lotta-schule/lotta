import * as React from 'react';
import { render, waitFor } from 'test/util';
import { GetTagsQuery } from 'api/query/GetTagsQuery';
import { TagsSelect } from './TagsSelect';
import { FetchResult } from '@apollo/client';
import userEvent from '@testing-library/user-event';

describe('component/layouts/editArticleLayouut/TagsSelect', () => {
    const getAdditionalMocks = (fn: () => FetchResult) => [
        {
            request: {
                query: GetTagsQuery,
            },
            result: fn,
        },
    ];

    it('should render a RelatedArticlesList without error', async () => {
        render(<TagsSelect value={[]} onChange={() => {}} />, {}, {});
    });

    it('should show the correct options', async () => {
        const resFn = jest.fn(() => ({
            data: { tags: ['tag', 'noch ein tag', 'wieder-tag'] },
        }));
        const screen = render(
            <TagsSelect value={[]} onChange={() => {}} />,
            {},
            { additionalMocks: getAdditionalMocks(resFn) }
        );
        userEvent.click(screen.getByRole('textbox'));
        await waitFor(() => {
            expect(resFn).toHaveBeenCalled();
        });
        expect(
            screen.queryAllByRole('option').map((o) => o.textContent)
        ).toEqual(['tag', 'noch ein tag', 'wieder-tag']);
    });

    it('should call onChange with the selected tag', async () => {
        const resFn = jest.fn(() => ({
            data: { tags: ['tag', 'noch ein tag', 'wieder-tag'] },
        }));
        const onChangeFn = jest.fn();
        const screen = render(
            <TagsSelect value={[]} onChange={onChangeFn} />,
            {},
            { additionalMocks: getAdditionalMocks(resFn) }
        );
        userEvent.click(screen.getByRole('textbox'));
        await waitFor(() => {
            expect(resFn).toHaveBeenCalled();
        });
        userEvent.click(screen.getByRole('option', { name: /noch ein tag/i }));
        expect(onChangeFn).toHaveBeenCalledWith(['noch ein tag']);
    });

    it('should show the given tags', async () => {
        const screen = render(
            <TagsSelect value={['A', 'B']} onChange={() => {}} />,
            {},
            {}
        );
        expect(screen.getByRole('button', { name: 'A' })).toBeVisible();
        expect(screen.getByRole('button', { name: 'B' })).toBeVisible();
    });
});
