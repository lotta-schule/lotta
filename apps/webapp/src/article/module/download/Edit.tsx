import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Input, SortableDraggableList } from '@lotta-schule/hubert';
import { ContentModuleModel, FileModel } from 'model';
import { SelectFileButton } from 'shared/edit/SelectFileButton';

import styles from './Download.module.scss';

export interface EditProps {
  contentModule: ContentModuleModel;
  onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit = React.memo<EditProps>(
  ({ contentModule, onUpdateModule }) => {
    const [isDragging, setIsDragging] = React.useState(false);
    const getConfiguration = React.useCallback(
      (file: FileModel) => {
        if (
          contentModule.configuration &&
          contentModule.configuration.files &&
          contentModule.configuration.files[file.id]
        ) {
          return {
            description: '',
            sortKey: 0,
            ...contentModule.configuration.files[file.id],
          };
        } else {
          return {
            description: '',
            sortKey: 0,
          };
        }
      },
      [contentModule]
    );

    const sortedFiles = React.useMemo(
      () =>
        Array.from(contentModule.files).sort(
          (a, b) =>
            (getConfiguration(a).sortKey || 0) -
            (getConfiguration(b).sortKey || 0)
        ),
      [contentModule.files, getConfiguration]
    );

    return (
      <div className={styles.root}>
        <SortableDraggableList
          id={`downloads-${contentModule.id}`}
          items={sortedFiles.map((f) => ({
            id: f.id,
            title: f.filename,
            children: (
              <div style={{ opacity: isDragging ? 0.5 : 1 }}>
                <Input
                  multiline
                  className={styles.textArea}
                  placeholder={`Beschreibung des Downloads`}
                  defaultValue={getConfiguration(f).description}
                  onBlur={(event) =>
                    onUpdateModule({
                      ...contentModule,
                      configuration: {
                        ...contentModule.configuration,
                        files: {
                          ...contentModule.configuration.files,
                          [f.id]: {
                            ...getConfiguration(f),
                            description: event.target.value,
                          },
                        },
                      },
                    })
                  }
                />
              </div>
            ),
            icon: <Icon icon={faTrash} />,
            onClickIcon: () => {
              onUpdateModule({
                ...contentModule,
                files: contentModule.files.filter((file) => file.id !== f.id),
              });
            },
          }))}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={() => setIsDragging(false)}
          onChange={(files) => {
            const updatedFiles = files.map((file, index) => ({
              id: file.id,
              sortKey: index * 10 + 10,
            }));

            const updatedConfiguration = {
              ...contentModule.configuration,
              files: updatedFiles.reduce((filesConfig, { id, sortKey }) => {
                return {
                  ...filesConfig,
                  [id]: { ...filesConfig[id], sortKey },
                };
              }, contentModule.configuration?.files || {}),
            };
            onUpdateModule({
              ...contentModule,
              configuration: updatedConfiguration,
            });
          }}
        />
        <SelectFileButton
          multiple
          label={'Datei hinzufügen'}
          onSelect={(files: FileModel[]) => {
            const duplicateFiles = files.filter((file) =>
              contentModule.files.find((f) => f.id === file.id)
            );
            duplicateFiles.forEach((file) => {
              alert(
                `Die Datei "${file.filename}" ist schon im Modul vorhanden und wird nicht neu hinzugefügt.`
              );
            });
            onUpdateModule({
              ...contentModule,
              files: contentModule.files.concat(
                files.filter(
                  (file) => !duplicateFiles.find((f) => f.id === file.id)
                )
              ),
              configuration: {
                ...contentModule.configuration,
                files: {
                  ...(contentModule.configuration || {}).files,
                  ...files.reduce(
                    (prev, file, i) => ({
                      ...prev,
                      [file.id]: {
                        ...getConfiguration(file),
                        sortKey: contentModule.files.length * 10 + (i + 1) * 10,
                      },
                    }),
                    {}
                  ),
                },
              },
            });
          }}
        />
      </div>
    );
  }
);
Edit.displayName = 'FormEdit';
