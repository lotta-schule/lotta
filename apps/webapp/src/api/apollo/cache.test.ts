import { gql, InMemoryCache } from '@apollo/client';
import { isMobileDrawerOpenVar, createCache } from './cache';

describe('Apollo Client Cache', () => {
  beforeEach(() => {
    isMobileDrawerOpenVar(false);
  });

  it('should initialize the reactive variable to false', () => {
    expect(isMobileDrawerOpenVar()).toBe(false);
  });

  it('should create a cache', () => {
    const cache = createCache();

    expect(cache).toBeInstanceOf(InMemoryCache);
  });

  describe('files of a directory', () => {
    const FILES = gql`
      query Files($parentDirectoryId: ID, $filter: FileFilter) {
        files(parentDirectoryId: $parentDirectoryId, filter: $filter) {
          id
        }
      }
    `;
    const file = (id: string) => ({ __typename: 'File', id });
    const writePage = (cache: InMemoryCache, ids: string[], afterId?: string) =>
      cache.writeQuery({
        query: FILES,
        variables: {
          parentDirectoryId: 'dir',
          filter: afterId ? { afterId } : undefined,
        },
        data: { files: ids.map(file) },
      });
    const readIds = (cache: InMemoryCache) =>
      cache
        .readQuery<{ files: { id: string }[] }>({
          query: FILES,
          variables: { parentDirectoryId: 'dir' },
        })
        ?.files.map((f) => f.id);

    it('appends following pages', () => {
      const cache = createCache();
      writePage(cache, ['1', '2']);
      writePage(cache, ['3'], '2');
      expect(readIds(cache)).toEqual(['1', '2', '3']);
    });

    it('lists a file of a following page only once', () => {
      const cache = createCache();
      writePage(cache, ['1', '2', 'uploaded']);
      writePage(cache, ['3', 'uploaded'], '2');
      expect(readIds(cache)).toEqual(['1', '2', 'uploaded', '3']);
    });

    it('replaces the list with a new first page', () => {
      const cache = createCache();
      writePage(cache, ['1', '2']);
      writePage(cache, ['2']);
      expect(readIds(cache)).toEqual(['2']);
    });
  });
});
