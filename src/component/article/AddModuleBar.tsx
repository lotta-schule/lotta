import React, { FunctionComponent, memo } from 'react';
import { makeStyles } from '@material-ui/styles';
import { Theme, Typography, Grid } from '@material-ui/core';
import { TextFormat, FormatAlignLeft, Image, BurstMode, Audiotrack, MovieCreation, FileCopyOutlined, Feedback } from '@material-ui/icons';
import { ContentModuleModel, ContentModuleType } from 'model';
import { AddModuleButton } from './AddModuleButton';
import { Value } from 'slate';
import { useCurrentUser } from 'util/user/useCurrentUser';
const { serialize } = require('slate-base64-serializer').default;

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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.TEXT,
                                text: serialize(Value.fromJSON({ object: "value", document: { object: "document", data: {}, nodes: [{ object: "block", type: "paragraph", data: {}, nodes: [{ object: 'text', text: "Lorem ipsum...", marks: [] } as any] }] } })),
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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.TITLE,
                                text: 'Titel',
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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.IMAGE,
                                text: undefined,
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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.IMAGE_COLLECTION,
                                text: undefined,
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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.VIDEO,
                                text: undefined,
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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.AUDIO,
                                text: undefined,
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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.DOWNLOAD,
                                text: '[]',
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
                                id: new Date().getTime() + Math.random() * 1000,
                                sortKey: null!,
                                type: ContentModuleType.FORM,
                                configuration: { destination: currentUser!.email, elements: [] },
                                text: undefined,
                                files: [],
                            });
                        }}
                    />
                </Grid>
            </Grid>
        </div>
    );

});