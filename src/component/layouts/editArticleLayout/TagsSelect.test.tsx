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

    it('should render a TagsSelect without error', async () => {
        render(<TagsSelect value={[]} onChange={() => {}} />, {}, {});
    });

    it('should show the given tags', () => {
        const screen = render(
            <TagsSelect value={['tag1', 'tag2']} onChange={() => {}} />,
            {},
            {}
        );
        const tagElements = screen.getAllByTestId('Tag');
        expect(tagElements).toHaveLength(2);
        ['tag1', 'tag2'].forEach((tag) => {
            expect(
                tagElements.find((t) => t.textContent === tag)
            ).toBeDefined();
        });
    });

    it('should show a delete button for tags', () => {
        const fn = jest.fn();
        const screen = render(
            <TagsSelect value={['tag1']} onChange={fn} />,
            {},
            {}
        );
        const tagElement = screen.getByTestId('Tag');
        expect(tagElement.querySelector('button')).toBeVisible();
        userEvent.click(tagElement.querySelector('button')!);
        expect(fn).toHaveBeenCalledWith([]);
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
        expect(screen.getByRole('textbox')).toBeVisible();
        userEvent.type(screen.getByRole('textbox'), 'ta');
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
        userEvent.type(screen.getByRole('textbox'), 'ta');
        await waitFor(() => {
            expect(resFn).toHaveBeenCalled();
        });
        userEvent.click(screen.getByRole('option', { name: /noch ein tag/i }));
        expect(onChangeFn).toHaveBeenCalledWith(['noch ein tag']);
    });

    it('should clear the input when a tag is added', async () => {
        const resFn = jest.fn(() => ({
            data: { tags: ['tag', 'noch ein tag', 'wieder-tag'] },
        }));
        const onChangeFn = jest.fn();
        const screen = render(
            <TagsSelect value={[]} onChange={onChangeFn} />,
            {},
            { additionalMocks: getAdditionalMocks(resFn) }
        );
        userEvent.type(screen.getByRole('textbox'), 'ta{enter}');
        expect(screen.getByRole('textbox')).toHaveValue('');
    });
});
