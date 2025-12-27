import { render, userEvent } from 'test/util';
import { Config } from './Config';
import { ContentModuleModel } from 'model';

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

  it('should toggle state and call onUpdateModule', async () => {
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
  });
});
