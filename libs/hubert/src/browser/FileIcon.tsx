import * as React from 'react';
import {
  File,
  FileArchive,
  FileAudio,
  FileImage,
  FilePDF,
  FilePowerPoint,
  FileTable,
  FileText,
  FileVideo,
} from '../icon';

export type FileIconProps = {
  mimeType?: string;
} & Omit<React.SVGProps<SVGSVGElement>, 'ref'>;

export const FileIcon = React.memo(({ mimeType, ...props }: FileIconProps) => {
  const type = React.useMemo(() => {
    if (mimeType?.startsWith('image/')) {
      return 'image';
    }
    if (mimeType?.startsWith('audio/')) {
      return 'audio';
    }
    if (mimeType?.startsWith('video/')) {
      return 'video';
    }
    switch (mimeType) {
      case 'application/pdf':
        return 'pdf';
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
        return 'doc';
      case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
        return 'xls';
      case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
        return 'ppt';
      case 'application/zip':
        return 'zip';
      default:
        return 'file';
    }
  }, [mimeType]);

  const Icon = React.useMemo(() => {
    switch (type) {
      case 'pdf':
        return <FilePDF {...props} />;
      case 'doc':
        return <FileText {...props} />;
      case 'xls':
        return <FileTable {...props} />;
      case 'ppt':
        return <FilePowerPoint {...props} />;
      case 'zip':
        return <FileArchive {...props} />;
      case 'image':
        return <FileImage {...props} />;
      case 'audio':
        return <FileAudio {...props} />;
      case 'video':
        return <FileVideo {...props} />;
      default:
        return <File {...props} />;
    }
  }, [props, type]);

  return Icon;
});
FileIcon.displayName = 'FileIcon';
