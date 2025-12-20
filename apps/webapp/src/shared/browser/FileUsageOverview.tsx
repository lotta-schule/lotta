import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye } from '@fortawesome/free-solid-svg-icons';
import { FileModel, ID } from 'model';
import { FileUsageModal } from './FileUsageModal';

import GetFileDetailsQuery from 'api/query/GetFileDetailsQuery.graphql';

export type FileUsageOverviewProps = {
  file: FileModel;
};

export const FileUsageOverview = React.memo(
  ({ file }: FileUsageOverviewProps) => {
    const [isFileUsageModalOpen, setIsFileUsageModalOpen] =
      React.useState(false);

    const { data, loading: isLoading } = useQuery<
      { file: FileModel },
      { id: ID }
    >(GetFileDetailsQuery, {
      variables: { id: file.id },
      fetchPolicy: 'cache-first',
    });

    const fileUsageCount = data?.file.usage?.length ?? 0;

    if (isLoading) {
      return null;
    }

    return (
      <>
        <span
          onClick={() => {
            if (fileUsageCount > 0) {
              setIsFileUsageModalOpen(true);
            }
          }}
          style={{ cursor: fileUsageCount > 0 ? 'pointer' : 'default' }}
        >
          <FontAwesomeIcon
            icon={faEye}
            style={{
              color:
                fileUsageCount > 0
                  ? 'rgb(var(--lotta-primary-color))'
                  : undefined,
            }}
          />{' '}
          {fileUsageCount}
        </span>
        <FileUsageModal
          file={file}
          isOpen={isFileUsageModalOpen}
          onRequestClose={() => setIsFileUsageModalOpen(false)}
        />
      </>
    );
  }
);
FileUsageOverview.displayName = 'FileUsageOverview';
