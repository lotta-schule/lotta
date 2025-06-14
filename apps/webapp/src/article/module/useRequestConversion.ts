import * as React from 'react';
import { useMutation } from '@apollo/client';
import { graphql } from 'api/graphql';
import { FileModel } from 'model';

export const REQUEST_FILE_CONVERSION = graphql(`
  mutation RequestFileConversion($id: ID!, $category: String!) {
    requestFileConversion(id: $id, category: $category)
  }
`);

export const useRequestConversion = (
  category: string,
  currentFile?: FileModel | null
) => {
  const [sendMutation, { loading: isLoading, called }] = useMutation(
    REQUEST_FILE_CONVERSION
  );

  const currentRequest = React.useMemo(() => {
    if (called) {
      return {
        progress: 0,
        formats: [],
      };
    }
  }, [called]);

  const makeRequest = React.useCallback(
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

  return React.useMemo(
    () => [makeRequest, currentRequest] as const,
    [makeRequest, currentRequest]
  );
};
