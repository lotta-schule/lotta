import * as React from 'react';
import { useMutation, useSubscription } from '@apollo/client/react';
import { graphql } from 'api/graphql';
import { FileModel } from 'model';

export const REQUEST_FILE_CONVERSION = graphql(`
  mutation requestFileConversion($id: ID!, $category: String!) {
    requestFileConversion(id: $id, category: $category)
  }
`);

export const CONVERSION_PROGRESS = graphql(`
  subscription conversionProgress($fileId: ID!) {
    conversionProgress(fileId: $fileId) {
      id
      formats {
        availability {
          status
          progress
          error
        }
        name
        url
        type
      }
    }
  }
`);

export const useRequestConversion = (
  category: string,
  currentFile?: FileModel | null
) => {
  const [sendMutation, { loading: isLoading }] = useMutation(
    REQUEST_FILE_CONVERSION
  );

  useSubscription(CONVERSION_PROGRESS, {
    variables: {
      fileId: currentFile?.id || '',
    },
    skip: !currentFile?.id,
  });

  return React.useCallback(
    (file: FileModel) => {
      if (!file?.id) {
        throw new Error('File ID is required to request conversion');
      }

      if (file.id === currentFile?.id) {
        return Promise.resolve(true);
      }

      if (isLoading) {
        return Promise.resolve(true);
      }
      return sendMutation({
        variables: {
          id: file.id,
          category,
        },
      });
    },
    [currentFile?.id, isLoading, sendMutation, category]
  );
};
