import * as React from 'react';
import { MockLink } from '@apollo/client/testing';
import { imageFile, tenant } from 'test/fixtures';
import { render, fireEvent, waitFor, userEvent } from 'test/util';
import { TenantModel } from 'model';
import { Presentation } from './Presentation';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const mockTenant: TenantModel = {
  ...tenant,
  backgroundImageFile: imageFile,
  configuration: {
    userMaxStorageConfig: '100',

    customTheme: {
      primaryColor: '#000000',
      navigationBackgroundColor: '#FFFFFF',
      errorColor: '#FF0000',
      successColor: '#00FF00',
      navigationContrastTextColor: '#0000FF',
      disabledColor: '#AAAAAA',
      textColor: '#123456',
      labelTextColor: '#654321',
      primaryContrastTextColor: '#789ABC',
      boxBackgroundColor: '#CBA987',
      pageBackgroundColor: '#FEDCBA',
      dividerColor: '#ABCDEF',
      highlightColor: '#123ABC',
      bannerBackgroundColor: '#DEF123',
      spacing: '10px',
      borderRadius: '5px',
      titleFontFamily: 'Arial',
      textFontFamily: 'Verdana',
    },
  },
};

describe('Presentation', () => {
  it('should render correctly', () => {
    const screen = render(
      <Presentation tenant={mockTenant} additionalThemes={[]} />
    );

    expect(screen.getByText('Vorlagen')).toBeInTheDocument();
    expect(screen.getByText('Farben')).toBeInTheDocument();
    expect(screen.getByText('Maße')).toBeInTheDocument();
    expect(screen.getByText('Schriftarten')).toBeInTheDocument();
  });

  it('should update the color settings', async () => {
    const screen = render(
      <Presentation tenant={mockTenant} additionalThemes={[]} />
    );

    const colorInput = screen.getByLabelText('Akzente');
    fireEvent.change(colorInput, { target: { value: '#123123' } });

    await waitFor(() => {
      expect(colorInput).toHaveValue('#123123');
    });
  });

  it('should update spacing and border radius', async () => {
    const user = userEvent.setup();
    const screen = render(
      <Presentation tenant={mockTenant} additionalThemes={[]} />
    );

    const spacingInput = screen.getByLabelText('Abstand');
    await user.fill(spacingInput, '20px');

    const borderRadiusInput = screen.getByLabelText('Rundungen');
    await user.fill(borderRadiusInput, '10px');

    expect(spacingInput).toHaveValue('20px');
    expect(borderRadiusInput).toHaveValue('10px');
  });

  it('should select a template', async () => {
    const screen = render(
      <Presentation
        tenant={mockTenant}
        additionalThemes={[
          { title: 'MyTemplate', theme: { textColor: '#ff0000' } },
        ]}
      />
    );

    const button = screen.getByText('MyTemplate');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByLabelText('Text')).toHaveValue('#ff0000');
    });
  });

  it('should save the changes', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn(() => ({
      data: { tenant: { ...mockTenant, logoImageFile: null } },
    }));
    const additionalMocks: MockLink.MockedResponse[] = [
      {
        request: {
          query: UpdateTenantMutation,
          variables(_vars) {
            return true;
          },
        },
        result: onResult,
      },
    ];

    const screen = render(
      <Presentation tenant={mockTenant} additionalThemes={[]} />,
      {},
      { additionalMocks }
    );

    const saveButton = screen.getByText('speichern');
    await user.click(saveButton);

    await waitFor(() => {
      expect(onResult).toHaveBeenCalled();
    });
  });
});
