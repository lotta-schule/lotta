import * as React from 'react';
import {
  File,
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

export const FileIcon = React.memo(
  React.forwardRef<SVGSVGElement, FileIconProps>(
    ({ mimeType, ...props }, ref) => {
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
            return <FilePDF {...props} ref={ref} />;
          case 'doc':
            return <FileText {...props} ref={ref} />;
          case 'xls':
            return <FileTable {...props} ref={ref} />;
          case 'ppt':
            return <FilePowerPoint {...props} ref={ref} />;
          // case 'zip':
          //   return <Zip />;
          case 'image':
            return <FileImage {...props} ref={ref} />;
          // case 'audio':
          //   return <Audio />;
          case 'video':
            return <FileVideo {...props} ref={ref} />;
          default:
            return <File {...props} ref={ref} />;
        }
      }, [type]);

      return Icon;
    }
  )
);
FileIcon.displayName = 'FileIcon';
