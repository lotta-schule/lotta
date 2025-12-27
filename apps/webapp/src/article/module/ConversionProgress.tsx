import { useQuery } from '@apollo/client/react';
import { CircularProgress } from '@lotta-schule/hubert';
import { useTranslation } from 'react-i18next';
import { graphql } from 'api/graphql';
import * as React from 'react';

import styles from './ConversionProgress.module.scss';

export const GET_FILE_FORMATS_QUERY = graphql(`
  query file($id: ID!) {
    file(id: $id) {
      id
      formats {
        availability {
          status
        }
        name
      }
    }
  }
`);

export const ConversionProgress = React.memo(
  ({ fileId, category }: { fileId: string | undefined; category: string }) => {
    const { data } = useQuery(GET_FILE_FORMATS_QUERY, {
      variables: { id: fileId || '' },
      skip: !fileId,
      fetchPolicy: 'cache-only',
      ssr: false,
    });
    const { t } = useTranslation();

    const categoryFormats = React.useMemo(
      () =>
        data?.file?.formats.filter((format) =>
          format.name.toLowerCase().startsWith(category.toLowerCase() + '_')
        ),
      [data?.file?.formats, category]
    );

    const completedFormats = React.useMemo(
      () =>
        categoryFormats?.filter(
          (format) => format.availability.status === 'READY'
        ),
      [categoryFormats]
    );

    const processingFormats = React.useMemo(
      () =>
        categoryFormats?.filter(
          (format) => format.availability.status !== 'READY'
        ),
      [categoryFormats]
    );

    const progress = React.useMemo(() => {
      if (!categoryFormats?.length || !completedFormats || !processingFormats) {
        return null;
      }

      if (completedFormats.length === categoryFormats.length) {
        return null;
      }

      if (completedFormats.length === categoryFormats.length) {
        return null;
      }

      return Math.floor(
        (1 - processingFormats.length / categoryFormats.length) * 100
      );
    }, [categoryFormats, completedFormats, processingFormats]);

    if (progress === null) {
      return null;
    }

    return (
      <div className={styles.root} data-testid="conversion-progress">
        <CircularProgress
          className={styles.progress}
          aria-labelledby={`conversion-progress-text-${fileId}`}
          size={'1em'}
          value={progress === 0 ? undefined : progress}
          isIndeterminate={progress === 0}
        />
        <span id={`conversion-progress-text-${fileId}`}>
          {t(
            'The file is being converted. In the meantime, there may be issues with playback. The conversion will continue in the background even after closing the page.'
          )}
        </span>
      </div>
    );
  }
);
ConversionProgress.displayName = 'ConversionProgress';
