import { render } from 'test/util';
import { Show as ShowVideo } from './Show';
import { ContentModuleType } from 'model';
import { movieFile } from 'test/fixtures';

describe('Video ContentModule (non-editable)', () => {
  it('should render a video with caption when a file is set', () => {
    const screen = render(
      <ShowVideo
        contentModule={{
          id: '1',
          insertedAt: new Date().toString(),
          updatedAt: new Date().toString(),
          sortKey: 1,
          type: ContentModuleType.VIDEO,
          content: {
            captions: ['Some caption'],
          },
          configuration: {
            isUsingFullHeight: true,
          },
          files: [movieFile],
        }}
      />
    );
    expect(screen.getByTestId('video')).toBeVisible();
    expect(screen.getByText('Some caption')).toBeVisible();
  });

  it('should render nothing if no file is set', () => {
    const screen = render(
      <ShowVideo
        contentModule={{
          id: '1',
          insertedAt: new Date().toString(),
          updatedAt: new Date().toString(),
          sortKey: 1,
          type: ContentModuleType.VIDEO,
          content: {
            captions: ['Some caption'],
          },
          configuration: {
            isUsingFullHeight: true,
          },
          files: [],
        }}
      />
    );

    expect(screen.queryByTestId('video')).toBeNull();
    expect(screen.queryByTestId('placeholder-image')).toBeNull();
    expect(screen.queryByText('Some caption')).toBeNull();
  });
});
