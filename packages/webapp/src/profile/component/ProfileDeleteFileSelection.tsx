import * as React from 'react';
import { Checkbox, Table, Tooltip } from '@lotta-schule/hubert';
import { FileModel } from 'model';
import { Article, Category, File } from 'util/model';
import { useServerData } from 'shared/ServerDataContext';
import Link from 'next/link';

export interface ProfileDeleteFileSelectionProps {
  files: FileModel[];
  selectedFiles: FileModel[];
  onSelectFiles(files: FileModel[]): void;
}

export const ProfileDeleteFileSelection =
  React.memo<ProfileDeleteFileSelectionProps>(
    ({ files, selectedFiles, onSelectFiles }) => {
      const { baseUrl } = useServerData();
      if (!files?.length) {
        return null;
      }

      const allFilesValue =
        selectedFiles.length === 0
          ? 'off'
          : selectedFiles.length === files.length
            ? 'on'
            : 'mixed';

      return (
        <Table>
          <thead>
            <tr>
              <td>
                <Checkbox
                  value={allFilesValue}
                  isSelected={allFilesValue === 'on'}
                  onChange={(isSelected) => {
                    onSelectFiles(isSelected ? [...files] : []);
                  }}
                  aria-label={'Alle Dateien übergeben'}
                />
              </td>
              <td>Ordner</td>
              <td>Dateiname</td>
              <td>Nutzung</td>
            </tr>
          </thead>
          <tbody>
            {files.map((file) => {
              const previewImageUrl = File.getPreviewImageLocation(
                baseUrl,
                file
              );

              const nameTableCell = (() => {
                if (previewImageUrl) {
                  return (
                    <td scope="row" id={`file-${file.id}-filename`}>
                      <Tooltip
                        style={{
                          backgroundColor: 'transparent',
                        }}
                        label={
                          <img src={previewImageUrl} alt={file.filename} />
                        }
                      >
                        <span>{file.filename}</span>
                      </Tooltip>
                    </td>
                  );
                } else {
                  return (
                    <td scope="row" id={`file-${file.id}-filename`}>
                      {file.filename}
                    </td>
                  );
                }
              })();

              const fileUsageCell = (() => (
                <td>
                  {file.usage
                    ?.filter((u) => u.category || u.article)
                    .map((usage, i) => {
                      const linkTarget = (() => {
                        if (usage.category) {
                          return Category.getPath(usage.category);
                        } else if (usage.article) {
                          return Article.getPath(usage.article);
                        } else {
                          return '/';
                        }
                      })();
                      const linkText =
                        (usage.category ?? usage.article)?.title ??
                        '[ Logo der Seite ]';
                      return (
                        <li key={i}>
                          <Link href={linkTarget} passHref target={'_blank'}>
                            {linkText}
                          </Link>
                        </li>
                      );
                    })}
                </td>
              ))();

              const isSelected =
                selectedFiles.findIndex((f) => f.id === file.id) > -1;

              return (
                <tr aria-labelledby={`file-${file.id}-filename`} key={file.id}>
                  <td>
                    <Checkbox
                      isSelected={isSelected}
                      aria-labelledby={`file-${file.id}-filename`}
                      onChange={(isSelected) => {
                        if (isSelected) {
                          onSelectFiles([...selectedFiles, file]);
                        } else {
                          onSelectFiles(
                            selectedFiles.filter((f) => f.id !== file.id)
                          );
                        }
                      }}
                    />
                  </td>
                  <td>{file.parentDirectory.name}</td>
                  {nameTableCell}
                  {fileUsageCell}
                </tr>
              );
            })}
          </tbody>
        </Table>
      );
    }
  );
ProfileDeleteFileSelection.displayName = 'ProfileDeleteFileSelection';
