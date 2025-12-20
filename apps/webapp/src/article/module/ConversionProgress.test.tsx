import { render } from 'test/util';
import {
  ConversionProgress,
  GET_FILE_FORMATS_QUERY,
} from './ConversionProgress';
import { DataProxy } from '@apollo/client/v4-migration';
import { ResultOf, VariablesOf } from 'gql.tada';

type TDATA = ResultOf<typeof GET_FILE_FORMATS_QUERY>;
type TVARS = VariablesOf<typeof GET_FILE_FORMATS_QUERY>;

type NonNull<T> = Exclude<T, null | undefined>;

describe('ConversionProgress', () => {
  const fileId = '123';
  const category = 'videoplay';

  const createMock = (
    formats: NonNull<TDATA['file']>['formats']
  ): DataProxy.WriteQueryOptions<TDATA, TVARS> => ({
    query: GET_FILE_FORMATS_QUERY,
    variables: { id: fileId },
    data: {
      file: {
        id: fileId,
        formats,
      },
    },
  });

  it('renders null when fileId is undefined', () => {
    const screen = render(
      <ConversionProgress fileId={undefined} category={category} />
    );
    expect(screen.container.firstChild).toBeEmptyDOMElement();
  });

  it('renders null when no category formats are available', () => {
    const screen = render(
      <ConversionProgress fileId={fileId} category={category} />,
      {},
      {
        withCache: (cache) => {
          cache.writeQuery(
            createMock([
              { name: 'AUDIOPLAY_AAC', availability: { status: 'READY' } },
            ])
          );
          return cache;
        },
      }
    );
    expect(screen.container.firstChild).toBeEmptyDOMElement();
  });

  it('renders null when all category formats are READY', async () => {
    const screen = render(
      <ConversionProgress fileId={fileId} category={category} />,
      {},
      {
        withCache: (cache) => {
          cache.writeQuery(
            createMock([
              { name: 'VIDEOPLAY_480P_MP4', availability: { status: 'READY' } },
              {
                name: 'VIDEOPLAY_480P_WEBM',
                availability: { status: 'READY' },
              },
            ])
          );
          return cache;
        },
      }
    );
    expect(screen.container.firstChild).toBeEmptyDOMElement();
  });

  it('renders the progress bar and text when processing formats exist', async () => {
    const screen = render(
      <ConversionProgress fileId={fileId} category={category} />,
      {},
      {
        withCache: (cache) => {
          cache.writeQuery(
            createMock([
              { name: 'VIDEOPLAY_480P_MP4', availability: { status: 'READY' } },
              {
                name: 'VIDEOPLAY_480P_WEBM',
                availability: { status: 'PROCESSING' },
              },
              {
                name: 'VIDEOPLAY_720P_MP4',
                availability: { status: 'PROCESSING' },
              },
              {
                name: 'VIDEOPLAY_720P_WEBM',
                availability: { status: 'PROCESSING' },
              },
            ])
          );
          return cache;
        },
      }
    );

    // Wait for the query to resolve and component to render
    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).toHaveValue(25);

    expect(screen.getByText(/Datei wird umgewandelt/i)).toBeVisible();
  });

  it('renders with isIndeterminate true when progress is 0', async () => {
    const screen = render(
      <ConversionProgress fileId={fileId} category={category} />,
      {},
      {
        withCache: (cache) => {
          cache.writeQuery(
            createMock([
              {
                name: 'VIDEOPLAY_480P_MP4',
                availability: { status: 'PROCESSING' },
              },
              {
                name: 'VIDEOPLAY_480P_WEBM',
                availability: { status: 'PROCESSING' },
              },
            ])
          );
          return cache;
        },
      }
    );

    const progressBar = await screen.findByRole('progressbar');
    expect(progressBar).toBeInTheDocument();
    expect(progressBar).not.toHaveAttribute('value');
  });

  it('does not render if fileId changes to undefined after initial render', async () => {
    const screen = render(
      <ConversionProgress fileId={fileId} category={category} />,
      {},
      {
        withCache: (cache) => {
          cache.writeQuery(
            createMock([
              {
                name: 'VIDEOPLAY_480P_MP4',
                availability: { status: 'PROCESSING' },
              },
            ])
          );
          return cache;
        },
      }
    );

    await screen.findByRole('progressbar'); // Ensure initial render with progress

    screen.rerender(
      <ConversionProgress fileId={undefined} category={category} />
    );

    expect(screen.container.firstChild).toBeEmptyDOMElement();
  });
});
