import { renderHook, waitFor } from 'test/util';
import { movieFile } from 'test/fixtures';
import {
  REQUEST_FILE_CONVERSION,
  useRequestConversion,
} from './useRequestConversion';

describe('util/userAvatar/useCurrentUser', () => {
  it('should request a file to be converted', async () => {
    const onRequestResult = vitest.fn(() => ({
      data: { requestFileConversion: true },
    }));
    const screen = renderHook(
      () => useRequestConversion('videoplay'),
      {},
      {
        additionalMocks: [
          {
            request: {
              query: REQUEST_FILE_CONVERSION,
              variables: { id: movieFile.id, category: 'videoplay' },
            },
            result: onRequestResult,
          },
        ],
      }
    );
    const requestFileConversion = screen.result.current;

    expect(onRequestResult).not.toHaveBeenCalled();

    requestFileConversion(movieFile);
    await waitFor(() => {
      expect(onRequestResult).toHaveBeenCalledWith({
        id: movieFile.id,
        category: 'videoplay',
      });
    });
  });
});
