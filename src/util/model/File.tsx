import * as React from 'react';
import { User } from './User';
import {
    FileModel,
    FileModelType,
    DirectoryModel,
    UserModel,
    FileConversionModel,
} from 'model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFile,
    faFileAudio,
    faFileImage,
    faFileVideo,
    faFilePdf,
    faFolder,
} from '@fortawesome/free-regular-svg-icons';
import { faUser, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from 'shared/general/util/Tooltip';
import getConfig from 'next/config';

const {
    publicRuntimeConfig: { cloudimageToken },
} = getConfig();

export const File = {
    getIconForDirectory(directory: DirectoryModel) {
        const folderStyle = { fontSize: '1.45em' };
        const innerIconStyle = { fontSize: '.6em' };
        if (!directory.parentDirectory && directory.user) {
            return (
                <Tooltip label={'privater Ordner'}>
                    <span className="fa-layers">
                        <FontAwesomeIcon icon={faFolder} style={folderStyle} />
                        <FontAwesomeIcon icon={faUser} style={innerIconStyle} />
                    </span>
                </Tooltip>
            );
        }
        if (!directory.parentDirectory && !directory.user) {
            return (
                <Tooltip label={'privater Ordner'}>
                    <span className="fa-layers">
                        <FontAwesomeIcon icon={faFolder} style={folderStyle} />
                        <FontAwesomeIcon
                            icon={faGlobe}
                            style={innerIconStyle}
                        />
                    </span>
                </Tooltip>
            );
        }
        return (
            <Tooltip label={'Ordner'}>
                <span>
                    <FontAwesomeIcon icon={faFolder} style={folderStyle} />
                </span>
            </Tooltip>
        );
    },

    getIconForFile(file: FileModel) {
        switch (file.fileType) {
            case FileModelType.Pdf:
                return (
                    <Tooltip label={'PDF-Dokument'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFilePdf} />
                        </div>
                    </Tooltip>
                );
            case FileModelType.Audio:
                return (
                    <Tooltip label={'Audio'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFileAudio} />
                        </div>
                    </Tooltip>
                );
            case FileModelType.Image:
                return (
                    <Tooltip label={'Bild'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFileImage} />
                        </div>
                    </Tooltip>
                );
            case FileModelType.Video:
                return (
                    <Tooltip label={'Video'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFileVideo} />
                        </div>
                    </Tooltip>
                );
            default:
                return (
                    <Tooltip label={'Datei'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFile} />
                        </div>
                    </Tooltip>
                );
        }
    },

    getPreviewImageLocation(
        baseUrl: string,
        file?: FileModel,
        size: string = '200x200'
    ) {
        if (file) {
            if (file.fileType === FileModelType.Image) {
                return `https://${cloudimageToken}.cloudimg.io/bound/${size}/foil1/${File.getFileRemoteLocation(
                    baseUrl,
                    file
                )}`;
            } else {
                const imageConversionFile = file.fileConversions?.find((fc) =>
                    /^gif/.test(fc.format)
                );
                if (imageConversionFile) {
                    return `https://${cloudimageToken}.cloudimg.io/bound/${size}/foil1/${File.getFileConversionRemoteLocation(
                        baseUrl,
                        imageConversionFile
                    )}`;
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

    getFileRemoteLocation(baseUrl: string, file: FileModel, qs: string = '') {
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
