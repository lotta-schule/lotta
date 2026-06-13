import * as React from 'react';
import { render, userEvent } from '#/test/util.js';
import { ContentModuleModel, ContentModuleType } from '#/model/index.js';
import { FormConfiguration } from './Form.js';
import { Edit } from './Edit.js';

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

    expect(
      screen.getByRole('checkbox', { name: /formulardaten speichern/i })
    ).toBeChecked();
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
    expect(
      screen.getByRole('checkbox', { name: /formulardaten speichern/i })
    ).toBeChecked();
  });

  it('should be able to disable the internal database saving', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    expect(
      screen.getByRole('checkbox', { name: /formulardaten speichern/i })
    ).toBeChecked();
    await fireEvent.click(
      screen.getByRole('checkbox', { name: /formulardaten speichern/i })
    );

    expect(onUpdateModuleFn).toHaveBeenCalledWith({
      ...contentModule,
      configuration: {
        ...contentModule.configuration,
        save_internally: false,
      },
    });
    expect(
      screen.getByRole('checkbox', { name: /formulardaten speichern/i })
    ).toBeChecked();
  });

  it('should update an element label when editing it inline', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getAllByRole('button', { name: /bearbeiten/i })[0]
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
            name: 'feld3',
            element: 'input',
            type: 'text',
          },
        ],
      },
    });
    expect(
      screen.getByRole('checkbox', { name: /formulardaten speichern/i })
    ).toBeChecked();
  });
});
