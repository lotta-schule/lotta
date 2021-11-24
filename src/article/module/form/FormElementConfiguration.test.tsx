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
            userEvent.selectOptions(
                screen.getByRole('combobox', { name: /texteingabevariation/i }),
                'color'
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({ type: 'color' });
            expect(
                screen.getByRole('textbox', { name: /name/i })
            ).toBeVisible();
            userEvent.type(
                screen.getByRole('textbox', { name: /name/i }),
                '{selectall}1'
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({ name: '1' });
            expect(
                screen.getByRole('textbox', { name: /aufschrift/i })
            ).toBeVisible();
            userEvent.type(
                screen.getByRole('textbox', { name: /aufschrift/i }),
                '{selectall}2'
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({ label: '2' });
            expect(
                screen.getByRole('textbox', { name: /beschriftung/i })
            ).toBeVisible();
            userEvent.type(
                screen.getByRole('textbox', { name: /beschriftung/i }),
                '{selectall}3'
            );
            expect(updateElementFn).toHaveBeenLastCalledWith({
                descriptionText: '3',
            });
            expect(
                screen.getByRole('checkbox', { name: /mehrzeilig/i })
            ).toBeInTheDocument();
            userEvent.click(
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
        it('should provide element, type, name, label, descriptionText, required and options options', () => {
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
            userEvent.selectOptions(
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
            userEvent.click(
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
