import * as React from 'react';
import { useQuery } from '@apollo/client/react';
import { graphql } from '#/api/graphql';
import type { Image } from '../SlateCustomTypes';

export const GET_FILE_FORMATS = graphql(`
  query GET_FILE($id: ID!) {
    file(id: $id) {
      id
      formats(category: "PREVIEW") {
        availability {
          status
        }
        name
        type
        url
      }
    }
  }
`);

/** The file and the float / width style of an image element in a text module. */
export const useImageElement = (imageElement: Image) => {
  const { data } = useQuery(GET_FILE_FORMATS, {
    variables: {
      id: imageElement.fileId as string,
    },
    fetchPolicy: 'cache-first',
    nextFetchPolicy: 'cache-only',
    skip: !imageElement.fileId,
  });

  const style = React.useMemo<React.CSSProperties>(
    () => ({
      float: imageElement.alignment === 'left' ? 'left' : 'right',
      width:
        imageElement.size === 'large'
          ? 500
          : imageElement.size === 'small'
            ? 200
            : 300, // 'middle'
    }),
    [imageElement.alignment, imageElement.size]
  );

  return { file: data?.file, style };
};
