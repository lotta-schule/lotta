import { render } from 'test/util';
import { Config } from './Config';
import { ContentModuleModel } from 'model';
import userEvent from '@testing-library/user-event';

describe('ImageConfig Component', () => {
  const mockOnUpdateModule = vi.fn();
  const mockOnRequestClose = vi.fn();
  const contentModule: ContentModuleModel = {
    configuration: {
      isUsingFullHeight: false,
    },
  } as any;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component with correct initial state', async () => {
    const screen = render(
      <Config
        contentModule={contentModule}
        onUpdateModule={mockOnUpdateModule}
        onRequestClose={mockOnRequestClose}
      />
    );

    expect(
      screen.getByTestId('ImageContentModuleConfiguration')
    ).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).not.toBeChecked();
  });

  it('should toggle state and call onUpdateModule and onRequestClose', async () => {
    const user = userEvent.setup();

    const screen = render(
      <Config
        contentModule={contentModule}
        onUpdateModule={mockOnUpdateModule}
        onRequestClose={mockOnRequestClose}
      />
    );

    const checkbox = screen.getByRole('checkbox');

    // Initial state should be unchecked
    expect(checkbox).not.toBeChecked();

    // Click to check the checkbox
    await user.click(checkbox);

    expect(mockOnUpdateModule).toHaveBeenCalledWith({
      ...contentModule,
      configuration: {
        ...contentModule.configuration,
        isUsingFullHeight: true,
      },
    });

    expect(mockOnRequestClose).toHaveBeenCalled();
  });
});
