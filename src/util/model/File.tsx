import React from 'react';
import { FileModel, FileModelType } from 'model';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFile, faFileAudio, faFileImage, faFileVideo, faFolder, faFilePdf } from '@fortawesome/free-regular-svg-icons';
import { Tooltip } from '@material-ui/core';

export const File = {
    getIconForFile(file: FileModel) {
        switch (file.fileType) {
            case FileModelType.Directory:
                return (
                    <Tooltip title={'Ordner'}>
                        <div style={{ width: '100%' }}>
                            <FontAwesomeIcon icon={faFolder} />
                        </div>
                    </Tooltip>
                );
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
};