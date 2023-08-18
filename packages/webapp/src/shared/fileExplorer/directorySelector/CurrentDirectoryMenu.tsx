import * as React from 'react';
import { useQuery } from '@apollo/client';
import { Toolbar } from '@lotta-schule/hubert';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { DirectoryModel } from 'model';
import { DirectoryMenu } from './DirectoryMenu';
import { useSelectedDirectory } from './SelectedDirectoryContext';

import GetDirectoriesAndFilesQuery from 'api/query/GetDirectoriesAndFiles.graphql';
import { File } from 'util/model';

export const CurrentDirectoryMenu = React.memo(() => {
  const [path, setPath] = useSelectedDirectory();
  const currentUser = useCurrentUser();

  const { data } = useQuery<{
    directories: DirectoryModel[];
  }>(GetDirectoriesAndFilesQuery, {
    variables: {
      parentDirectoryId: path.at(-1)?.id ?? null,
    },
  });

  const filter = (directory: DirectoryModel) =>
    File.canEditDirectory(directory, currentUser);

  return (
    <div>
      <Toolbar>
        {path.map((c) => ('name' in c ? c.name : '')).join('/') || '/'}
      </Toolbar>
      <DirectoryMenu
        directories={(data?.directories ?? []).filter(filter)}
        parentDirectoryName={`.. (${(path.at(-1) as any)?.name ?? null})`}
        onSelectParent={
          path.length > 1 ? () => setPath(path.slice(0, -1)) : undefined
        }
        onSelectDirectory={(directory: DirectoryModel) => {
          setPath([...path, { id: directory.id, name: directory.name }]);
        }}
      />
    </div>
  );
});
CurrentDirectoryMenu.displayName = 'CurrentDirectoryMenu';
