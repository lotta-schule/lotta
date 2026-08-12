import * as React from 'react';
import { render, userEvent } from '#/test/util';
import { ContentModuleModel, ContentModuleType } from '#/model';
import { FormConfiguration } from './Form';
import { Edit } from './Edit';

describe('shared/article/modules/form/Edit', () => {
  const contentModule: ContentModuleModel<any, FormConfiguration> = {
    id: '31415',
    type: ContentModuleType.FORM,
    configuration: {
      elements: [
        {
          name: 'kontakt',
          element: 'input',
          type: 'text',
        },
        {
          name: 'groesse',
          element: 'selection',
          type: 'radio',
          options: [
            { value: 'S' },
            { value: 'M', selected: true },
            { value: 'XL' },
          ],
        },
      ],
      destination: 'a@b.de',
      save_internally: true,
    },
    files: [],
    sortKey: 0,
    insertedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it('should render the correct init form elements', () => {
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={() => {}} />
    );
    expect(screen.getByText(/erforderlich\?/i)).toBeInTheDocument();
    expect(
      screen.getAllByRole('button', { name: /bearbeiten/i }).length
    ).toBeGreaterThan(0);
    expect(screen.getByRole('radio', { name: /m/i })).toBeInTheDocument();

    expect(
      screen.getByRole('checkbox', { name: /per e-mail versenden/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /per e-mail versenden/i })
    ).toBeChecked();
    expect(
      screen.getByRole('textbox', { name: /an folgende e-mail/i })
    ).toHaveValue('a@b.de');
  });

  it('should be able to disable the destination mail', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getByRole('checkbox', { name: /per e-mail versenden/i })
    );
    expect(
      screen.getByRole('checkbox', { name: /per e-mail versenden/i })
    ).toBeChecked();
    expect(
      screen.getByRole('textbox', { name: /an folgende e-mail/i })
    ).toHaveValue('a@b.de');

    expect(onUpdateModuleFn).toHaveBeenCalledWith({
      ...contentModule,
      configuration: {
        ...contentModule.configuration,
        destination: undefined,
      },
    });
  });

  it('should update an element label when editing it inline', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getAllByRole('button', { name: 'bearbeiten' })[0]
    );
    const input = screen.getByRole('textbox', { name: /bezeichnung/i });
    await fireEvent.clear(input);
    await fireEvent.type(input, 'Neue Bezeichnung{enter}');

    expect(onUpdateModuleFn).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: expect.objectContaining({
          elements: [
            expect.objectContaining({
              name: 'kontakt',
              label: 'Neue Bezeichnung',
            }),
            expect.objectContaining({ name: 'groesse' }),
          ],
        }),
      })
    );
  });

  it('should allow clearing an element label (caption) to empty', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getAllByRole('button', { name: 'bearbeiten' })[0]
    );
    const input = screen.getByRole('textbox', { name: /bezeichnung/i });
    await fireEvent.clear(input);
    await fireEvent.type(input, '{enter}');

    expect(onUpdateModuleFn).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: expect.objectContaining({
          elements: [
            expect.objectContaining({ name: 'kontakt', label: '' }),
            expect.objectContaining({ name: 'groesse' }),
          ],
        }),
      })
    );
  });

  it('should update an element name when editing it inline in the header', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getAllByRole('button', { name: 'Feldnamen bearbeiten' })[0]
    );
    const input = screen.getByRole('textbox', { name: /feldname/i });
    await fireEvent.clear(input);
    await fireEvent.type(input, 'kontaktperson{enter}');

    expect(onUpdateModuleFn).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: expect.objectContaining({
          elements: [
            expect.objectContaining({ name: 'kontaktperson' }),
            expect.objectContaining({ name: 'groesse' }),
          ],
        }),
      })
    );
  });

  it('should add an option to a selection element', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /option hinzufügen/i })
    );

    expect(onUpdateModuleFn).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: expect.objectContaining({
          elements: [
            expect.objectContaining({ name: 'kontakt' }),
            expect.objectContaining({
              name: 'groesse',
              options: [
                { value: 'S' },
                { value: 'M', selected: true },
                { value: 'XL' },
                { label: 'Option 4', value: 'option4' },
              ],
            }),
          ],
        }),
      })
    );
  });

  it('should add an input when clicking on the "add element button"', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /feld hinzufügen/i })
    );
    await fireEvent.click(screen.getByRole('menuitem', { name: /textzeile/i }));

    expect(onUpdateModuleFn).toHaveBeenCalledWith({
      ...contentModule,
      configuration: {
        ...contentModule.configuration,
        elements: [
          ...contentModule.configuration!.elements,
          {
            name: 'Textzeile',
            element: 'input',
            type: 'text',
          },
        ],
      },
    });
  });

  it('should suffix the default field name when it is already in use', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const contentModuleWithTextField: ContentModuleModel<
      any,
      FormConfiguration
    > = {
      ...contentModule,
      configuration: {
        ...contentModule.configuration!,
        elements: [
          ...contentModule.configuration!.elements,
          { name: 'Textzeile', element: 'input', type: 'text' },
        ],
      },
    };
    const screen = render(
      <Edit
        contentModule={contentModuleWithTextField}
        onUpdateModule={onUpdateModuleFn}
      />
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /feld hinzufügen/i })
    );
    await fireEvent.click(screen.getByRole('menuitem', { name: /textzeile/i }));

    expect(onUpdateModuleFn).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: expect.objectContaining({
          elements: expect.arrayContaining([
            expect.objectContaining({ name: 'Textzeile (2)' }),
          ]),
        }),
      })
    );
  });

  it('should force a destination email and disable the checkbox once a file field is added', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const contentModuleWithoutDestination: ContentModuleModel<
      any,
      FormConfiguration
    > = {
      ...contentModule,
      configuration: {
        ...contentModule.configuration!,
        destination: undefined,
      },
    };
    const screen = render(
      <Edit
        contentModule={contentModuleWithoutDestination}
        onUpdateModule={onUpdateModuleFn}
      />
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /feld hinzufügen/i })
    );
    await fireEvent.click(
      screen.getByRole('menuitem', { name: /datei-upload/i })
    );

    expect(onUpdateModuleFn).toHaveBeenCalledWith(
      expect.objectContaining({
        configuration: expect.objectContaining({
          destination: expect.any(String),
        }),
      })
    );
  });
});
