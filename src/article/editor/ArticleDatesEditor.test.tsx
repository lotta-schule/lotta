import * as React from 'react';
import { Weihnachtsmarkt } from 'test/fixtures';
import { render } from 'test/util';
import { ArticleDatesEditor } from './ArticleDatesEditor';
import userEvent from '@testing-library/user-event';

describe('shared/layouts/editArticleLayout/ArticleDatesEditor', () => {
    it('should render without error', () => {
        render(
            <ArticleDatesEditor
                isOpen
                article={Weihnachtsmarkt}
                onUpdate={jest.fn()}
                onAbort={jest.fn()}
            />
        );
    });

    it('should show the the inserted at date input with correct value', () => {
        const screen = render(
            <ArticleDatesEditor
                isOpen
                article={Weihnachtsmarkt}
                onUpdate={jest.fn()}
                onAbort={jest.fn()}
            />
        );
        expect(
            screen.getByRole('textbox', { name: /erstellt/i, hidden: true })
        ).toHaveValue('2019-06-01');
    });

    it('should show the the updated at date input with correct value', () => {
        const screen = render(
            <ArticleDatesEditor
                isOpen
                article={Weihnachtsmarkt}
                onUpdate={jest.fn()}
                onAbort={jest.fn()}
            />
        );
        expect(
            screen.getByRole('textbox', { name: /geändert/i, hidden: true })
        ).toHaveValue('2020-10-11');
    });

    it('should call onAbort when cancel button is clicked', async () => {
        const fireEvent = userEvent.setup();
        const onAbort = jest.fn();
        const screen = render(
            <ArticleDatesEditor
                isOpen
                article={Weihnachtsmarkt}
                onUpdate={jest.fn()}
                onAbort={onAbort}
            />
        );
        await fireEvent.click(
            screen.getByRole('button', { name: /abbrechen/i })
        );
        expect(onAbort).toHaveBeenCalled();
    });

    it('should call onUpdate when save button is clicked', async () => {
        const fireEvent = userEvent.setup();
        const onUpdate = jest.fn();
        const screen = render(
            <ArticleDatesEditor
                isOpen
                article={Weihnachtsmarkt}
                onUpdate={onUpdate}
                onAbort={jest.fn()}
            />
        );
        const createdInput = screen.getByRole('textbox', {
            name: /erstellt/i,
            hidden: true,
        }) as HTMLInputElement;
        await fireEvent.type(createdInput, '1999-01-01', {
            initialSelectionStart: 0,
            initialSelectionEnd: createdInput.value.length,
        });
        await fireEvent.click(screen.getByRole('button', { name: /OK/i }));
        expect(onUpdate).toHaveBeenCalledWith({
            insertedAt: '1999-01-01T00:00:00.000Z',
        });
    });
});
