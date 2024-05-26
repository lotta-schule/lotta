import * as React from 'react';
import { imageFile, tenant } from 'test/fixtures';
import { render, fireEvent, waitFor } from 'test/util';
import { TenantModel } from 'model';
import { Presentation } from './Presentation';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';
import userEvent from '@testing-library/user-event';
import { MockedResponse } from '@apollo/client/testing';

const mockTenant: TenantModel = {
  ...tenant,
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
    backgroundImageFile: imageFile,
  },
};

describe('Presentation', () => {
  it('should render correctly', () => {
    const screen = render(
      <Presentation
        tenant={mockTenant}
        additionalThemes={[]}
        baseUrl="https://example.com"
      />
    );

    expect(screen.getByText('Vorlagen')).toBeInTheDocument();
    expect(screen.getByText('Farben')).toBeInTheDocument();
    expect(screen.getByText('Maße')).toBeInTheDocument();
    expect(screen.getByText('Schriften')).toBeInTheDocument();
  });

  it('should update the color settings', async () => {
    const screen = render(
      <Presentation
        tenant={mockTenant}
        additionalThemes={[]}
        baseUrl="https://example.com"
      />
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
      <Presentation
        tenant={mockTenant}
        additionalThemes={[]}
        baseUrl="https://example.com"
      />
    );

    const spacingInput = screen.getByLabelText('Abstand');
    await user.type(spacingInput, '{backspace}20px', {
      initialSelectionStart: 0,
      initialSelectionEnd: 4,
    });

    const borderRadiusInput = screen.getByLabelText('Rundungen');
    await user.type(borderRadiusInput, '{backspace}10px', {
      initialSelectionStart: 0,
      initialSelectionEnd: 4,
    });

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
        baseUrl="https://example.com"
      />
    );

    const button = screen.getByText('MyTemplate');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByLabelText('Text')).toHaveValue('#ff0000');
    });
  });

  it.only('should save the changes', async () => {
    const user = userEvent.setup();
    const onResult = vi.fn(() => ({
      data: { tenant: { ...mockTenant, logoImageFile: null } },
    }));
    const additionalMocks: MockedResponse[] = [
      {
        variableMatcher: () => true,
        request: {
          query: UpdateTenantMutation,
        },
        result: onResult,
      },
    ];

    const screen = render(
      <Presentation
        tenant={mockTenant}
        additionalThemes={[]}
        baseUrl="https://example.com"
      />,
      {},
      { additionalMocks }
    );

    const saveButton = screen.getByText('speichern');
    await user.click(saveButton);

    expect(onResult).toHaveBeenCalled();
  });
});
