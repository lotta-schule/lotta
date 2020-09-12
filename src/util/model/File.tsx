import React from 'react';
import { User } from './User';
import { FileModel, FileModelType, DirectoryModel, UserModel } from 'model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFileAudio, faFileImage, faFileVideo, faFilePdf, faFolder, } from '@fortawesome/free-regular-svg-icons';
import { faUser, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { Tooltip } from '@material-ui/core';

export const File = {
    getIconForDirectory(directory: DirectoryModel) {
        const folderStyle = { fontSize: '1.45em' };
        const innerIconStyle = { fontSize: '.6em', };
        if (!directory.parentDirectory && directory.user) {
            return (
                <Tooltip title={'privater Ordner'}>
                    <span className="fa-layers">
                        <FontAwesomeIcon icon={faFolder} style={folderStyle} />
                        <FontAwesomeIcon icon={faUser} style={innerIconStyle} />
                    </span>
                </Tooltip>
            );
        }
        if (!directory.parentDirectory && !directory.user) {
            return (
                <Tooltip title={'privater Ordner'}>
                    <span className="fa-layers">
                        <FontAwesomeIcon icon={faFolder} style={folderStyle} />
                        <FontAwesomeIcon icon={faGlobe} style={innerIconStyle} />
                    </span>
                </Tooltip>
            );
        }
        return (
            <Tooltip title={'Ordner'}>
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
                    <Tooltip title={'PDF-Dokument'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFilePdf} />
                        </div>
                    </Tooltip>
                );
            case FileModelType.Audio:
                return (
                    <Tooltip title={'Audio'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFileAudio} />
                        </div>
                    </Tooltip>
                );
            case FileModelType.Image:
                return (
                    <Tooltip title={'Bild'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFileImage} />
                        </div>
                    </Tooltip>
                );
            case FileModelType.Video:
                return (
                    <Tooltip title={'Video'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFileVideo} />
                        </div>
                    </Tooltip>
                );
            default:
                return (
                    <Tooltip title={'Datei'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFile} />
                        </div>
                    </Tooltip>
                );
        }
    },

    getPreviewImageLocation(file?: FileModel, size: string = '200x200') {
        if (file) {
            if (file.fileType === FileModelType.Image) {
                return `https://afdptjdxen.cloudimg.io/bound/${size}/foil1/${file.remoteLocation}`
            } else {
                const imageConversionFile = file.fileConversions?.find(fc => /^gif/.test(fc.format));
                if (imageConversionFile) {
                    return `https://afdptjdxen.cloudimg.io/bound/${size}/foil1/${imageConversionFile.remoteLocation}`;
                }
            }
        }
        return null;
    },

    getSameOriginUrl(file: FileModel) {
        if (process.env.REACT_APP_FILE_REPLACEMENT_URL) {
            return file.remoteLocation?.replace(new RegExp(`^${process.env.REACT_APP_FILE_REPLACEMENT_URL}`), '');
        }
        return file.remoteLocation;
    },

    canEditDirectory(directory: DirectoryModel, user: UserModel | null) {
        return user && (directory.user?.id === user.id || User.isAdmin(user));
    },

    canCreateDirectory(directory: DirectoryModel, user: UserModel | null) {
        if (directory.id === null) {
            // root directory
            return true;
        }
        return this.canEditDirectory(directory, user);
    }
};
