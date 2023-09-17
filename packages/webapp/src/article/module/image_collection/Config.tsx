import * as React from 'react';
import { Option, Select } from '@lotta-schule/hubert';
import { ContentModuleModel, FileModel } from 'model';

import styles from '../Config.module.scss';

export enum ImageStyle {
  GALLERY = 1,
  CAROUSEL = 2,
}

export enum Sorting {
  NONE = 0,
  FILENAME_ASC = 1,
  FILENAME_DESC = 2,
  FILE_UPLOAD_DATE_ASC = 3,
  FILE_UPLOAD_DATE_DESC = 4,
}

interface ConfigProps {
  contentModule: ContentModuleModel;
  onUpdateModule(contentModule: ContentModuleModel): void;
  onRequestClose(): void;
}

export const FileSorter =
  (
    contendModule: ContentModuleModel,
    getConfiguration: (f: FileModel) => any
  ) =>
  (file1: FileModel, file2: FileModel) => {
    const sorting = contendModule.configuration?.sorting ?? Sorting.NONE;
    switch (sorting) {
      case Sorting.FILENAME_ASC:
        return file1.filename.localeCompare(file2.filename);
      case Sorting.FILENAME_DESC:
        return file2.filename.localeCompare(file1.filename);
      case Sorting.FILE_UPLOAD_DATE_ASC:
        return (
          new Date(file1.insertedAt).getTime() -
          new Date(file2.insertedAt).getTime()
        );
      case Sorting.FILE_UPLOAD_DATE_DESC:
        return (
          new Date(file2.insertedAt).getTime() -
          new Date(file1.insertedAt).getTime()
        );
      default:
        return (
          getConfiguration(file1).sortKey - getConfiguration(file2).sortKey
        );
    }
  };

export const Config = React.memo(
  ({ contentModule, onUpdateModule, onRequestClose }: ConfigProps) => {
    const imageStyle: ImageStyle =
      contentModule.configuration?.imageStyle ?? ImageStyle.GALLERY;

    const sorting: Sorting =
      contentModule.configuration?.sorting ?? Sorting.NONE;

    return (
      <form data-testid="ImageCollectionContentModuleConfiguration">
        <Select
          fullWidth
          className={styles.formControl}
          title={'Stil'}
          value={String(imageStyle)}
          onChange={(imageStyleString) => {
            const imageStyle = Number(imageStyleString);
            onUpdateModule({
              ...contentModule,
              configuration: {
                ...contentModule.configuration,
                imageStyle,
              },
            });
            onRequestClose();
          }}
          name={'image-style'}
          id={'image-style'}
        >
          <Option value={String(ImageStyle.GALLERY)}>Galerie</Option>
          <Option value={String(ImageStyle.CAROUSEL)}>Carousel</Option>
        </Select>

        <Select
          fullWidth
          className={styles.formControl}
          title={'Sortierung'}
          value={String(sorting)}
          onChange={(sortingString) => {
            const sorting = Number(sortingString);
            onUpdateModule({
              ...contentModule,
              configuration: {
                ...contentModule.configuration,
                sorting,
              },
            });
            onRequestClose();
          }}
          name={'sorting'}
          id={'sorting'}
        >
          <Option value={String(Sorting.NONE)}>Eigene</Option>
          <Option value={String(Sorting.FILENAME_ASC)}>
            Dateiname (aufsteigend)
          </Option>
          <Option value={String(Sorting.FILENAME_DESC)}>
            Dateiname (absteigend)
          </Option>
          <Option value={String(Sorting.FILE_UPLOAD_DATE_ASC)}>
            Hochlade-Datum (aufsteigend)
          </Option>
          <Option value={String(Sorting.FILE_UPLOAD_DATE_DESC)}>
            Hochlade-Datum (absteigend)
          </Option>
        </Select>
      </form>
    );
  }
);
Config.displayName = 'ImageCollectionConfig';
