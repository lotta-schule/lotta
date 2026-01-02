import * as React from 'react';
import { Checkbox, Table, Tooltip } from '@lotta-schule/hubert';
import { Article, Category } from 'util/model';
import Link from 'next/link';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { RelevantFilesInUsage } from '..';

export interface FileSelectionProps {
  files: RelevantFilesInUsage;
  selectedFiles: RelevantFilesInUsage;
  onSelectFiles(files: RelevantFilesInUsage): void;
}

export const FileSelection = React.memo<FileSelectionProps>(
  ({ files, selectedFiles, onSelectFiles }) => {
    const selectedFileIds = React.useMemo(
      () => new Set(selectedFiles.map((f) => f.id)),
      [selectedFiles]
    );

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
            const nameTableCell = (() => {
              if (file.formats.some((f) => f.name.startsWith('preview'))) {
                return (
                  <td scope="row" id={`file-${file.id}-filename`}>
                    <Tooltip
                      style={{
                        backgroundColor: 'transparent',
                      }}
                      label={
                        <ResponsiveImage
                          file={file}
                          alt={file.filename}
                          format="preview"
                        />
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

            const isSelected = selectedFileIds.has(file.id);

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
                <td>{file.parentDirectory?.name}</td>
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
FileSelection.displayName = 'ProfileDeleteFileSelection';
