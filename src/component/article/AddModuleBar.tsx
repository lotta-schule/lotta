import * as React from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Grid } from '@material-ui/core';
import { TextFormat, FormatAlignLeft, Image, BurstMode, Audiotrack, MovieCreation, FileCopyOutlined, Feedback, TableChart } from '@material-ui/icons';
import { ContentModuleModel, ContentModuleType, ID } from 'model';
import { AddModuleButton } from './AddModuleButton';
import { useCurrentUser } from 'util/user/useCurrentUser';

const useStyles = makeStyles((theme: Theme) => ({
    root: {
        padding: '1em',
        margin: '0.5em 0 0 0',
        backgroundColor: theme.palette.background.paper,
        '& button': {
            width: '100%'
        }
    }
}));

export interface AddModuleBarProps {
    onAddModule(module: ContentModuleModel): void;
}

export const AddModuleBar = React.memo<AddModuleBarProps>(({ onAddModule }) => {

    const styles = useStyles();
    const currentUser = useCurrentUser();

    const createId = (): ID => String(-(new Date().getTime() + Math.random() * 1000));

    const createModule = (moduleProps: Partial<ContentModuleModel>) => {
        onAddModule({
            id: createId(),
            sortKey: null,
            files: [],
            ...moduleProps
        } as ContentModuleModel);
    };

    return (
        <div className={styles.root} data-testid="AddModuleBar">
            <Typography style={{ marginBottom: '1em' }}>Wähle ein Modul aus, das du zum Beitrag hinzufügen möchtest.</Typography>
            <Grid
                container
                direction={'row'}
                justify={'center'}
                color={'primary'}
                alignItems={'center'}
                spacing={3}
            >
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Text'}
                        icon={<FormatAlignLeft />}
                        onClick={() => {
                            createModule({
                                type: ContentModuleType.TEXT,
                                content: {
                                    nodes: [{ type: 'paragraph', children: [{ text: 'Dein Text ...' }] }]
                                }
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
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
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Dateien'}
                        icon={<FileCopyOutlined />}
                        onClick={() => {
                            createModule({ type: ContentModuleType.DOWNLOAD, });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Formular'}
                        icon={<Feedback />}
                        onClick={() => {
                            createModule({
                                type: ContentModuleType.FORM,
                                configuration: { destination: currentUser!.email, save_internally: true, elements: [] },
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Tabelle'}
                        icon={<TableChart />}
                        onClick={() => {
                            createModule({
                                type: ContentModuleType.TABLE,
                                configuration: {
                                    headRow: true
                                },
                                content: {
                                    rows: [
                                        [{ text: 'A' }, { text: 'B' }, { text: 'C' }],
                                        [{ text: '1' }, { text: '2' }, { text: '3' }]
                                    ]
                                },
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Bild'}
                        icon={<Image />}
                        onClick={() => {
                            createModule({ type: ContentModuleType.IMAGE, });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Galerie'}
                        icon={<BurstMode />}
                        onClick={() => {
                            createModule({ type: ContentModuleType.IMAGE_COLLECTION, });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Video'}
                        icon={<MovieCreation />}
                        onClick={() => {
                            createModule({ type: ContentModuleType.VIDEO, });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Audio'}
                        icon={<Audiotrack />}
                        onClick={() => {
                            createModule({ type: ContentModuleType.AUDIO, });
                        }}
                    />
                </Grid>
            </Grid>
        </div>
    );

});
