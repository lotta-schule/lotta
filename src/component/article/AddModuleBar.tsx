import React, { FunctionComponent, memo } from 'react';
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

export const AddModuleBar: FunctionComponent<AddModuleBarProps> = memo(({ onAddModule }) => {

    const styles = useStyles();
    const [currentUser] = useCurrentUser();

    const createId = (): ID => String(-(new Date().getTime() + Math.random() * 1000));

    return (
        <div className={styles.root}>
            <Typography style={{ marginBottom: '1em' }}>Füge ein Modul zum Beitrag hinzu, indem du darauf klickst.</Typography>
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
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.TEXT,
                                content: (() => {
                                    return { nodes: [{ type: 'paragraph', children: [{ text: 'lorem ipsum ...' }] }] };
                                })(),
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Titel'}
                        icon={<TextFormat />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.TITLE,
                                content: { text: 'Titel' },
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Dateien'}
                        icon={<FileCopyOutlined />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.DOWNLOAD,
                                content: null,
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Formular'}
                        icon={<Feedback />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.FORM,
                                configuration: { destination: currentUser!.email, save_internally: true, elements: [] },
                                content: null,
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Tabelle'}
                        icon={<TableChart />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
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
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Bild'}
                        icon={<Image />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.IMAGE,
                                content: null,
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Galerie'}
                        icon={<BurstMode />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.IMAGE_COLLECTION,
                                content: null,
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Video'}
                        icon={<MovieCreation />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.VIDEO,
                                content: null,
                                files: [],
                            });
                        }}
                    />
                </Grid>
                <Grid item xs={4} sm={3} md={2}>
                    <AddModuleButton
                        label={'Audio'}
                        icon={<Audiotrack />}
                        onClick={() => {
                            onAddModule({
                                id: createId(),
                                sortKey: null!,
                                type: ContentModuleType.AUDIO,
                                content: null,
                                files: [],
                            });
                        }}
                    />
                </Grid>
            </Grid>
        </div>
    );

});
