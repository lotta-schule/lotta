import {
  FileModel,
  FileModelType,
  DirectoryModel,
  UserModel,
  FileConversionModel,
} from 'model';
import { ProcessingOptions, createImageUrl } from 'util/image/useImageUrl';
import { User } from './User';

export const File = {
  getPreviewImageLocation(
    baseUrl: string,
    file?: FileModel,
    sizeOrResizeOptions: number | ProcessingOptions = 200
  ) {
    if (file) {
      if (file.fileType === FileModelType.Image) {
        return createImageUrl(
          File.getFileRemoteLocation(baseUrl, file),
          typeof sizeOrResizeOptions === 'number'
            ? {
                width: sizeOrResizeOptions,
                aspectRatio: '4:3',
                resize: 'cover',
              }
            : sizeOrResizeOptions
        );
      } else {
        const imageConversionFile = file.fileConversions?.find((fc) =>
          /^gif/.test(fc.format)
        );
        if (imageConversionFile) {
          return createImageUrl(
            File.getFileConversionRemoteLocation(baseUrl, imageConversionFile),
            typeof sizeOrResizeOptions === 'number'
              ? {
                  width: sizeOrResizeOptions,
                  aspectRatio: '4:3',
                  resize: 'cover',
                }
              : sizeOrResizeOptions
          );
        }
      }
    }
    return null;
  },

  canEditDirectory(
    directory: DirectoryModel,
    user: UserModel | null | undefined
  ) {
    return user && (directory.user?.id === user.id || User.isAdmin(user));
  },

  canCreateDirectory(
    directory: DirectoryModel,
    user: UserModel | null | undefined
  ) {
    if (directory.id === null) {
      return true; // Is a root directory
    }
    return this.canEditDirectory(directory, user);
  },

  getFileRemoteLocation(baseUrl: string, file: FileModel, qs = '') {
    return [baseUrl, 'storage', 'f', file.id]
      .join('/')
      .concat(qs ? `?${qs}` : '');
  },

  getFileConversionRemoteLocation(
    baseUrl: string,
    fileConversion: FileConversionModel
  ) {
    return [baseUrl, 'storage', 'fc', fileConversion.id].join('/');
  },
};
