import React from 'react';
import { render } from 'test/util';
import { FormElementConfiguration } from './FormElementConfiguration';
import { FormElement } from './Form';
import userEvent from '@testing-library/user-event';

describe('shared/article/module/form/FormElementConfiguration', () => {
    describe('configuring an input element', () => {
        const element: FormElement = {
            element: 'input',
            type: 'email',
            name: 'blabla',
        };
        it('should provide element, type, name, label, descriptionText, required and multiline options', async () => {
            const fireEvent = userEvent.setup();
            const updateElementFn = jest.fn();
            const screen = render(
                <FormElementConfiguration
                    element={element}
                    updateElement={updateElementFn}
                />
            );
            expect(
                screen.getByRole('combobox', { name: /art der eingabe/i })
            ).toHaveValue('input');
            await fireEvent.selectOptions(
                screen.getByRole('combobox', { name: /texteingabevariation/i }),
                'color'
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({ type: 'color' });
            const nameInput = screen.getByRole('textbox', {
                name: /name/i,
            }) as HTMLInputElement;
            expect(nameInput).toBeVisible();
            await fireEvent.type(nameInput, '1', {
                initialSelectionStart: 0,
                initialSelectionEnd: nameInput.value.length,
            });
            expect(updateElementFn).toHaveBeenLastCalledWith({ name: '1' });

            const aufschriftInput = screen.getByRole('textbox', {
                name: /aufschrift/i,
            }) as HTMLInputElement;
            expect(aufschriftInput).toBeVisible();
            await fireEvent.type(aufschriftInput, '2', {
                initialSelectionStart: 0,
                initialSelectionEnd: aufschriftInput.value.length,
            });
            expect(updateElementFn).toHaveBeenLastCalledWith({ label: '2' });

            const descriptionTextInput = screen.getByRole('textbox', {
                name: /beschriftung/i,
            }) as HTMLInputElement;
            expect(descriptionTextInput).toBeVisible();
            await fireEvent.type(descriptionTextInput, '3', {
                initialSelectionStart: 0,
                initialSelectionEnd: descriptionTextInput.value.length,
            });
            expect(updateElementFn).toHaveBeenLastCalledWith({
                descriptionText: '3',
            });

            expect(
                screen.getByRole('checkbox', { name: /mehrzeilig/i })
            ).toBeInTheDocument();
            await fireEvent.click(
                screen.getByRole('checkbox', { name: /mehrzeilig/i })
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({
                multiline: true,
            });
        });

        it('should hide the element type if the input is set to multiline', () => {
            const screen = render(
                <FormElementConfiguration
                    element={{ ...element, multiline: true }}
                    updateElement={() => {}}
                />
            );
            expect(screen.queryByRole('button', { name: /email/i })).toBeNull();
        });
    });

    describe('configuring a selection element', () => {
        const element: FormElement = {
            element: 'selection',
            type: 'checkbox',
            name: 'blabla',
        };
        it('should provide element, type, name, label, descriptionText, required and options options', async () => {
            const fireEvent = userEvent.setup();
            const updateElementFn = jest.fn();
            const screen = render(
                <FormElementConfiguration
                    element={element}
                    updateElement={updateElementFn}
                />
            );
            expect(
                screen.getByRole('combobox', { name: /art der eingabe/i })
            ).toHaveValue('selection');
            expect(
                screen.getByRole('combobox', { name: /auswahlfeldvariation/i })
            ).toHaveValue('checkbox');
            await fireEvent.selectOptions(
                screen.getByRole('combobox', { name: /auswahlfeldvariation/i }),
                'radio'
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({ type: 'radio' });
            expect(
                screen.getByRole('textbox', { name: /name/i })
            ).toBeVisible();
            expect(
                screen.getByRole('textbox', { name: /aufschrift/i })
            ).toBeVisible();
            expect(
                screen.getByRole('textbox', { name: /beschriftung/i })
            ).toBeVisible();

            // Antwort hinzufügen
            await fireEvent.click(
                screen.getByRole('button', { name: /antwort hinzufügen/i })
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({
                options: [{ label: 'Auswahl Nummer 1', value: 'a1' }],
            });
        });
    });

    describe('configuring a file element', () => {
        const element: FormElement = {
            element: 'file',
            name: 'blabla',
        };
        it('should provide element, maxSize, name, label, descriptionText and required', () => {
            const screen = render(
                <FormElementConfiguration
                    element={element}
                    updateElement={() => {}}
                />
            );
            expect(
                screen.getByRole('combobox', { name: /art der eingabe/i })
            ).toHaveValue('file');
            expect(
                screen.getByRole('textbox', { name: /name/i })
            ).toBeVisible();
            expect(
                screen.getByRole('textbox', { name: /aufschrift/i })
            ).toBeVisible();
            expect(
                screen.getByRole('textbox', { name: /beschriftung/i })
            ).toBeVisible();
        });
    });
});
