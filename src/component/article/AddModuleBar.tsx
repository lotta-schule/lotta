import * as React from 'react';
import {
    Audiotrack,
    BurstMode,
    Feedback,
    FileCopyOutlined,
    FormatAlignLeft,
    Image as ImageIcon,
    MovieCreation,
    RemoveOutlined,
    TableChart,
    TextFormat,
} from '@material-ui/icons';
import { ContentModuleModel, ContentModuleType, ID } from 'model';
import { AddModuleButton } from './AddModuleButton';
import { useCurrentUser } from 'util/user/useCurrentUser';

import styles from './AddModuleBar.module.scss';

export interface AddModuleBarProps {
    onAddModule(module: ContentModuleModel): void;
}

export const AddModuleBar = React.memo<AddModuleBarProps>(({ onAddModule }) => {
    const currentUser = useCurrentUser();

    const createId = (): ID =>
        String(-(new Date().getTime() + Math.random() * 1000));

    const createModule = (moduleProps: Partial<ContentModuleModel>) => {
        onAddModule({
            id: createId(),
            sortKey: null,
            files: [],
            ...moduleProps,
        } as ContentModuleModel);
    };

    return (
        <div className={styles.root} data-testid="AddModuleBar">
            <div style={{ marginBottom: '1em' }}>
                Wähle ein Modul aus, das du zum Beitrag hinzufügen möchtest.
            </div>
            <div className={styles.buttonList}>
                <AddModuleButton
                    label={'Text'}
                    icon={<FormatAlignLeft />}
                    onClick={() => {
                        createModule({
                            type: ContentModuleType.TEXT,
                            content: {
                                nodes: [
                                    {
                                        type: 'paragraph',
                                        children: [{ text: 'Dein Text ...' }],
                                    },
                                ],
                            },
                        });
                    }}
                />
                <AddModuleButton
                    label={'Titel'}
                    icon={<TextFormat />}
                    onClick={() => {
                        createModule({
                            type: ContentModuleType.TITLE,
                            content: { title: 'Deine Überschrift ...' },
                        });
                    }}
                />
                <AddModuleButton
                    label={'Bild'}
                    icon={<ImageIcon />}
                    onClick={() => {
                        createModule({ type: ContentModuleType.IMAGE });
                    }}
                />
                <AddModuleButton
                    label={'Galerie'}
                    icon={<BurstMode />}
                    onClick={() => {
                        createModule({
                            type: ContentModuleType.IMAGE_COLLECTION,
                        });
                    }}
                />
                <AddModuleButton
                    label={'Dateien'}
                    icon={<FileCopyOutlined />}
                    onClick={() => {
                        createModule({ type: ContentModuleType.DOWNLOAD });
                    }}
                />
                <AddModuleButton
                    label={'Trennlinie'}
                    icon={<RemoveOutlined />}
                    onClick={() => {
                        createModule({ type: ContentModuleType.DIVIDER });
                    }}
                />
                <AddModuleButton
                    label={'Tabelle'}
                    icon={<TableChart />}
                    onClick={() => {
                        createModule({
                            type: ContentModuleType.TABLE,
                            configuration: {
                                headRow: true,
                            },
                            content: {
                                rows: [
                                    [
                                        { text: 'A' },
                                        { text: 'B' },
                                        { text: 'C' },
                                    ],
                                    [
                                        { text: '1' },
                                        { text: '2' },
                                        { text: '3' },
                                    ],
                                ],
                            },
                        });
                    }}
                />
                <AddModuleButton
                    label={'Formular'}
                    icon={<Feedback />}
                    onClick={() => {
                        createModule({
                            type: ContentModuleType.FORM,
                            configuration: {
                                destination: currentUser!.email,
                                save_internally: true,
                                elements: [],
                            },
                        });
                    }}
                />
                <AddModuleButton
                    label={'Video'}
                    icon={<MovieCreation />}
                    onClick={() => {
                        createModule({ type: ContentModuleType.VIDEO });
                    }}
                />
                <AddModuleButton
                    label={'Audio'}
                    icon={<Audiotrack />}
                    onClick={() => {
                        createModule({ type: ContentModuleType.AUDIO });
                    }}
                />
            </div>
        </div>
    );
});
AddModuleBar.displayName = 'AddModuleBar';
