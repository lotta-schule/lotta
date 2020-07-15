import React, { memo, useContext } from 'react';
import { Tooltip, Typography, makeStyles, Link } from '@material-ui/core';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { FileModel, ID } from 'model';
import { File, User } from 'util/model';
import { FileSize } from 'util/FileSize';
import { UserAvatar } from 'component/user/UserAvatar';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { GetFileDetailsQuery } from 'api/query/GetFileDetailsQuery';
import { useTranslation } from 'react-i18next';
import fileExplorerContext from './context/FileExplorerContext';

export interface FileDetailViewProps {
    file: FileModel;
}

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'stretch',
        height: '100%'
    },
    filename: {
        fontSize: '1.1rem',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        width: '100%',
        whiteSpace: 'nowrap',
        paddingBottom: theme.spacing(2)
    },
    filePreview: {
        backgroundColor: '#000',
        flexShrink: 1,
        overflow: 'auto',
        padding: theme.spacing(1),
        textAlign: 'center',
        margin: theme.spacing(0, -1),
        '& img': {
            maxWidth: 200,
            maxHeight: 200
        }
    },
    infoList: {
        marginTop: theme.spacing(1),
        borderTop: `1px solid ${theme.palette.divider}`,
        '& li': {
            marginTop: theme.spacing(1),
            overflow: 'auto'
        },
        '& li > :last-child': {
            float: 'right'
        }
    },
    userAvatar: {
        width: '.9em',
        height: '.9em',
        display: 'inline-block',
        marginRight: '.25em'
    }
}));

export const FileDetailView = memo<FileDetailViewProps>(({ file }) => {
    const { t } = useTranslation();
    const [, dispatch] = useContext(fileExplorerContext);
    const styles = useStyles();
    const { data, error } = useQuery<{ file: FileModel }, { id: ID }>(GetFileDetailsQuery, {
        variables: { id: file.id }
    });

    // @ts-ignore
    const get = <T extends any = string>(prop: string): T => data?.file?.[prop] ?? file[prop];
    return (
        <div className={styles.root}>
            <Tooltip title={get('filename')}>
                <Typography variant={'h3'} className={styles.filename}>{get('filename')}</Typography>
            </Tooltip>
            {File.getPreviewImageLocation(file) && (
              <div className={styles.filePreview}>
                      <img src={File.getPreviewImageLocation(file)!} alt={`Vorschau der Datei ${get('filename')}`} data-testid="PreviewImage" />
              </div>
            )}
            <ErrorMessage error={error} />
            <div style={{ flexGrow: 1 }} />
            <ul className={styles.infoList}>
                <li>
                    <strong>Größe:</strong><span>{new FileSize(get<number>('filesize')).humanize()}</span>
                </li>
                <li data-testid="DateListItem">
                    <strong>Datum:</strong><span>{format(new Date(get<Date>('insertedAt')), 'PPP', { locale: de })}</span>
                </li>
                <li data-testid="TypeListItem">
                    <strong>Typ:</strong>
                    <span>
                        <Tooltip title={file.mimeType}>
                            <span>{t(`files.filetypes.${file.fileType}`)}</span>
                        </Tooltip>
                    </span>
                </li>
                {data?.file?.user && (
                    <li data-testid="AuthorsListItem">
                        <strong>Autor:</strong>
                        <span>
                            <UserAvatar user={data.file.user} size={40} className={styles.userAvatar} />
                            {User.getNickname(data.file.user)}
                        </span>
                    </li>
                )}
                {data?.file?.usage !== undefined && (
                        <li data-testid="UsageListItem">
                            <strong>Verwendung:</strong>
                            <span>
                                {data.file.usage.length}x
                                {data.file.usage.length > 0 && (
                                    <>&nbsp;(<Link onClick={() => dispatch({ type: 'showFileUsage' })}>
                                        ansehen
                                    </Link>)&nbsp;</>
                                )}
                            </span>
                        </li>
                )}
                {!!(data?.file?.fileConversions?.length) && (
                    <>
                        <li data-testid="FileConversionsListItem">
                            <strong>Umwandlungen:</strong>
                            <span>
                                <Tooltip title={(
                                    <ul>
                                        {data.file.fileConversions.map(conversion => (
                                            <li key={conversion.id}>{conversion.format} - {conversion.mimeType}</li>
                                        ))}
                                    </ul>
                                )}>
                                    <span>{t('files.formats', { count: data.file.fileConversions.length})}</span>
                                </Tooltip>
                            </span>
                        </li>
                    </>
                )}
            </ul>
        </div>
    );
});
