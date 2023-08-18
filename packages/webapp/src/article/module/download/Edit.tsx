import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { Draggable, DragDropContext, Droppable } from 'react-beautiful-dnd';
import { ContentModuleModel, FileModel } from 'model';
import { Button, DragHandle, Input } from '@lotta-schule/hubert';
import { SelectFileButton } from 'shared/edit/SelectFileButton';
import { FileSize } from 'util/FileSize';

import styles from './Download.module.scss';

export interface EditProps {
  contentModule: ContentModuleModel;
  onUpdateModule(contentModule: ContentModuleModel): void;
}

export const Edit = React.memo<EditProps>(
  ({ contentModule, onUpdateModule }) => {
    const getConfiguration = (file: FileModel) => {
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
    };

    return (
      <div className={styles.root}>
        <DragDropContext
          onDragEnd={({ destination, source }) => {
            if (!destination) {
              return;
            }

            if (
              destination.droppableId === source.droppableId &&
              destination.index === source.index
            ) {
              return;
            }

            const filesConfiguration =
              (contentModule.configuration &&
                contentModule.configuration.files) ||
              {};
            const sortedFileIds = [...contentModule.files]
              .sort(
                (f1, f2) =>
                  getConfiguration(f1).sortKey - getConfiguration(f2).sortKey
              )
              .map((f) => f.id);
            const sourceId = sortedFileIds[source.index];
            sortedFileIds.splice(source.index, 1);
            sortedFileIds.splice(destination.index, 0, sourceId);
            const newFilesConfiguration = sortedFileIds.reduce(
              (prev, fileId, i) => {
                return {
                  ...prev,
                  [fileId]: {
                    ...filesConfiguration[fileId],
                    sortKey: i * 10,
                  },
                };
              },
              {}
            );
            onUpdateModule({
              ...contentModule,
              configuration: {
                ...contentModule.configuration,
                files: newFilesConfiguration,
              },
            });
          }}
        >
          <Droppable droppableId={String(contentModule.id)}>
            {(provided) => (
              <section {...provided.droppableProps} ref={provided.innerRef}>
                {[...contentModule.files]
                  .sort(
                    (f1, f2) =>
                      getConfiguration(f1).sortKey -
                      getConfiguration(f2).sortKey
                  )
                  .map((file, index) => (
                    <Draggable
                      key={file.id}
                      draggableId={String(file.id)}
                      index={index}
                    >
                      {(draggableProvided) => (
                        <div
                          className={styles.downloadItemWrapper}
                          key={file.id}
                          ref={draggableProvided.innerRef}
                          {...draggableProvided.draggableProps}
                        >
                          <div className={styles.downloadWrapperHeader}>
                            <span {...draggableProvided.dragHandleProps}>
                              <DragHandle className={styles.dragHandle} />
                            </span>
                            <div>
                              <div className={styles.downloadDescription}>
                                {file.filename}
                              </div>
                              <div className={styles.secondaryHeading}>
                                {new FileSize(file.filesize).humanize()}
                              </div>
                            </div>
                            <Button
                              icon={<Icon icon={faTrash} />}
                              onClick={() =>
                                onUpdateModule({
                                  ...contentModule,
                                  files: contentModule.files.filter(
                                    (f) => f.id !== file.id
                                  ),
                                })
                              }
                            />
                          </div>
                          <div className={styles.downloadDescription}>
                            <Input
                              multiline
                              className={styles.textArea}
                              placeholder={`Beschreibung des Downloads`}
                              defaultValue={getConfiguration(file).description}
                              onBlur={(event) =>
                                onUpdateModule({
                                  ...contentModule,
                                  configuration: {
                                    ...contentModule.configuration,
                                    files: {
                                      ...contentModule.configuration.files,
                                      [file.id]: {
                                        ...getConfiguration(file),
                                        description: event.target.value,
                                      },
                                    },
                                  },
                                })
                              }
                            />
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </section>
            )}
          </Droppable>
        </DragDropContext>
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
