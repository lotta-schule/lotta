import * as React from 'react';
import { render, userEvent } from 'test/util';
import { FormElementConfiguration } from './FormElementConfiguration';
import { FormElement } from './Form';

describe('shared/article/module/form/FormElementConfiguration', () => {
  describe('configuring an input element', () => {
    const element: FormElement = {
      element: 'input',
      type: 'email',
      name: 'blabla',
    };
    it('should provide element, type, name, label, descriptionText, required and multiline options', async () => {
      const user = userEvent.setup();
      const updateElementFn = vi.fn();
      const screen = render(
        <FormElementConfiguration
          element={element}
          updateElement={updateElementFn}
        />
      );
      await user.click(
        screen.getByRole('button', { name: /texteingabevariation/i })
      );

      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation

      await user.click(await screen.findByRole('option', { name: /farbe/i }));
      expect(updateElementFn).toHaveBeenLastCalledWith({ type: 'color' });
      const nameInput = screen.getByRole('textbox', {
        name: /name/i,
      }) as HTMLInputElement;
      expect(nameInput).toBeVisible();
      await user.fill(nameInput, '1');
      expect(updateElementFn).toHaveBeenLastCalledWith({ name: '1' });

      const aufschriftInput = screen.getByRole('textbox', {
        name: /aufschrift/i,
      }) as HTMLInputElement;
      expect(aufschriftInput).toBeVisible();
      await user.fill(aufschriftInput, '2');
      expect(updateElementFn).toHaveBeenLastCalledWith({ label: '2' });

      const descriptionTextInput = screen.getByRole('textbox', {
        name: /beschriftung/i,
      }) as HTMLInputElement;
      expect(descriptionTextInput).toBeVisible();
      await user.fill(descriptionTextInput, '3');
      expect(updateElementFn).toHaveBeenLastCalledWith({
        descriptionText: '3',
      });

      expect(
        screen.getByRole('checkbox', { name: /mehrzeilig/i })
      ).toBeInTheDocument();
      await user.click(screen.getByRole('checkbox', { name: /mehrzeilig/i }));
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
      const updateElementFn = vi.fn();
      const screen = render(
        <FormElementConfiguration
          element={element}
          updateElement={updateElementFn}
        />
      );
      expect(
        screen.getByRole('button', { name: /art der eingabe/i })
      ).toBeVisible();
      expect(
        screen.getByRole('button', { name: /auswahlfeldvariation/i })
      ).toBeVisible();
      await fireEvent.click(
        screen.getByRole('button', { name: /auswahlfeldvariation/i })
      );

      await new Promise((resolve) => setTimeout(resolve, 300)); // wait for animation

      await fireEvent.click(
        await screen.findByRole('option', { name: /radio/i })
      );
      expect(updateElementFn).toHaveBeenLastCalledWith({ type: 'radio' });
      expect(screen.getByRole('textbox', { name: /name/i })).toBeVisible();
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
        <FormElementConfiguration element={element} updateElement={() => {}} />
      );
      expect(
        screen.getByRole('button', { name: /art der eingabe/i })
      ).toBeVisible();
      expect(screen.getByRole('textbox', { name: /name/i })).toBeVisible();
      expect(
        screen.getByRole('textbox', { name: /aufschrift/i })
      ).toBeVisible();
      expect(
        screen.getByRole('textbox', { name: /beschriftung/i })
      ).toBeVisible();
    });
  });
});
