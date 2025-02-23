import { render } from 'test/util';
import { createFormats } from 'test/fixtures';
import { Image } from './Image';

describe('Image ContentModule', () => {
  it('should render an image with caption when a file is set', () => {
    const screen = render(
      <Image
        userCanEditArticle={true}
        onUpdateModule={vi.fn()}
        isEditModeEnabled={false}
        contentModule={
          {
            content: {
              caption: 'Some caption',
            },
            configuration: {
              isUsingFullHeight: true,
            },
            files: [
              {
                id: '1',
                mimeType: 'image/jpeg',
                formats: createFormats('image.jpg'),
              } as any,
            ],
          } as any
        }
      />
    );
    expect(screen.getByRole('img')).toBeVisible();
    expect(screen.getByText('Some caption')).toBeVisible();
  });

  it('should render nothing if no file is set', () => {
    const screen = render(
      <Image
        userCanEditArticle={true}
        onUpdateModule={vi.fn()}
        isEditModeEnabled={false}
        contentModule={
          {
            content: {
              caption: 'Some caption',
            },
            configuration: {
              isUsingFullHeight: true,
            },
            files: [],
          } as any
        }
      />
    );

    expect(screen.queryByRole('img')).toBeNull();
    expect(screen.queryByTestId('placeholder-image')).toBeNull();
    expect(screen.queryByText('Some caption')).toBeNull();
  });
});
