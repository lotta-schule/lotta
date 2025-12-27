import * as React from 'react';
import { render, userEvent } from 'test/util';
import { ContentModuleModel, ContentModuleType } from 'model';
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
    expect(
      screen.queryAllByRole('textbox', { name: /name/i })?.[0]
    ).toHaveValue('kontakt');
    expect(screen.getByRole('radio', { name: /m/i })).toBeInTheDocument();

    expect(
      screen.getByRole('checkbox', { name: /per email versenden/i })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('checkbox', { name: /per email versenden/i })
    ).toBeChecked();
    expect(
      screen.getByRole('textbox', { name: /an folgende email/i })
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
      screen.getByRole('checkbox', { name: /per email versenden/i })
    );
    expect(
      screen.getByRole('checkbox', { name: /per email versenden/i })
    ).toBeChecked();
    expect(
      screen.getByRole('textbox', { name: /an folgende email/i })
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

  it('should add an input when clicking on the "add element button"', async () => {
    const fireEvent = userEvent.setup();
    const onUpdateModuleFn = vi.fn();
    const screen = render(
      <Edit contentModule={contentModule} onUpdateModule={onUpdateModuleFn} />
    );
    await fireEvent.click(
      screen.getByRole('button', { name: /feld hinzufügen/i })
    );

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
