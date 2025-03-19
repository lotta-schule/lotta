import { render } from 'test/util';
import { Show as ShowAudio } from './Show';
import { ContentModuleType } from 'model';

describe('Audio ContentModule (non-editable)', () => {
  it('should render a video with caption when a file is set', () => {
    const screen = render(
      <ShowAudio
        contentModule={{
          id: '1',
          insertedAt: new Date().toString(),
          updatedAt: new Date().toString(),
          sortKey: 1,
          type: ContentModuleType.AUDIO,
          content: {
            captions: ['Some caption'],
          },
          configuration: {
            isUsingFullHeight: true,
          },
          files: [
            {
              id: '1',
              mimeType: 'video/mp3',
              fileConversions: [
                {
                  id: '1001',
                  mimeType: 'video/mp3',
                  format: 'video/mp3',
                  fileType: 'AUDIO',
                } as any,
              ],
            },
          ] as any,
        }}
      />
    );
    expect(screen.getByTestId('audio')).toBeVisible();
    expect(screen.getByText('Some caption')).toBeVisible();
  });

  it('should render nothing if no file is set', () => {
    const screen = render(
      <ShowAudio
        contentModule={{
          id: '1',
          insertedAt: new Date().toString(),
          updatedAt: new Date().toString(),
          sortKey: 1,
          type: ContentModuleType.AUDIO,
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

    expect(screen.queryByTestId('audio')).toBeNull();
    expect(screen.queryByTestId('placeholder-image')).toBeNull();
    expect(screen.queryByText('Some caption')).toBeNull();
  });
});
