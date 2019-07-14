import { ArticleModel, ContentModuleType } from '../../model';
import React, { FunctionComponent, memo, useState } from 'react';
import { Article } from '../article/Article';
import { EditArticleSidebar } from './editArticle/EditArticleSidebar';
import { Button, Grid, Typography, Theme, makeStyles, createStyles, Paper } from '@material-ui/core';
import { BaseLayoutSidebar } from './BaseLayoutSidebar';
import { BaseLayoutMainContent } from './BaseLayoutMainContent';
import { Value } from 'slate';
import { TextFormat, FormatListBulleted, FormatAlignLeft, AddPhotoAlternate, Audiotrack, MovieCreation, PictureAsPdf, Link } from '@material-ui/icons';
import useReactRouter from 'use-react-router';
const { serialize } = require('slate-base64-serializer').default;

const useStyles = makeStyles((theme: Theme) =>
    createStyles({
        root: {
            flexGrow: 1,
        },
        paper: {
            padding: theme.spacing(2),
            textAlign: 'center',
            backgroundColor: '#fff',
            color: theme.palette.secondary.main,
            borderColor: theme.palette.secondary.main,
            border: '1px solid'
        },
        layoutElements: {
            padding: '1em',
            margin: '0.5em 0 0 0',
            backgroundColor: '#fff'
        }
    }),
);

export interface ArticleLayoutProps {
    article: ArticleModel;
    onUpdateArticle?(article: ArticleModel): Promise<void>;
}

export const EditArticleLayout: FunctionComponent<ArticleLayoutProps> = memo(({ article, onUpdateArticle }) => {
    const [editedArticle, setEditedArticle] = useState(article);
    const { history } = useReactRouter();
    const classes = useStyles();

    return (
        <>
            <BaseLayoutMainContent>
                <Article article={editedArticle} isEditModeEnabled onUpdateArticle={setEditedArticle} />
                <div>
                    <Button
                        variant="outlined"
                        color={'primary'}
                        onClick={async () => {
                            setEditedArticle({
                                ...editedArticle,
                                contentModules: [
                                    ...editedArticle.contentModules,
                                    {
                                        id: new Date().getTime().toString(),
                                        sortKey: Math.max(...editedArticle.contentModules.map(cm => cm.sortKey || 0)) + 10,
                                        type: ContentModuleType.TEXT,
                                        text: serialize(Value.fromJSON({ object: "value", document: { object: "document", data: {}, nodes: [{ object: "block", type: "paragraph", data: {}, nodes: [{ object: 'text', text: "Lorem ipsum...", marks: [] } as any] }] } }))
                                    }
                                ]
                            });
                        }}
                    >
                        + TEXT
                    </Button>
                </div>
            </BaseLayoutMainContent>
            <BaseLayoutSidebar>
                <EditArticleSidebar
                    article={editedArticle}
                    onUpdate={setEditedArticle}
                    onSave={async () => {
                        await new Promise(resolve => setTimeout(resolve, 500));
                        if (onUpdateArticle) {
                            await onUpdateArticle(editedArticle);
                        }
                        history.push(editedArticle.pageName ? `/page/${editedArticle.pageName}` : `/article/${editedArticle.id}`);
                    }}
                />
                <Article article={editedArticle} isEditModeEnabled onUpdateArticle={setEditedArticle} />
                <div className={classes.layoutElements}>
                    <Typography style={{ marginBottom: '1em' }}>Füge ein Modul zum Beitrag hinzu, indem du drauf klickst.</Typography>
                    <Grid
                        sm={12}
                        container
                        direction="row"
                        justify="space-between"
                        color={'primary'}
                        alignItems="center"
                    >
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <TextFormat />
                                <Typography>Titel</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <FormatAlignLeft />
                                <Typography>Text</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <FormatListBulleted />
                                <Typography>Liste</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <AddPhotoAlternate />
                                <Typography>Bild</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <MovieCreation />
                                <Typography>Video</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <Audiotrack />
                                <Typography>Audio</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <PictureAsPdf />
                                <Typography>PDF</Typography>
                            </Paper>
                        </Grid>
                        <Grid item xs={1}>
                            <Paper className={classes.paper}>
                                <Link />
                                <Typography>Link</Typography>
                            </Paper>
                        </Grid>
                    </Grid>
                </div>
                <div>
                    <Button
                        variant="outlined"
                        color={'primary'}
                        onClick={async () => {
                            setEditedArticle({
                                ...editedArticle,
                                contentModules: [
                                    ...editedArticle.contentModules,
                                    {
                                        id: new Date().getTime().toString(),
                                        sortKey: Math.max(...editedArticle.contentModules.map(cm => cm.sortKey || 0)) + 10,
                                        type: ContentModuleType.TEXT,
                                        text: serialize(Value.fromJSON({ object: "value", document: { object: "document", data: {}, nodes: [{ object: "block", type: "paragraph", data: {}, nodes: [{ object: 'text', text: "Lorem ipsum...", marks: [] } as any] }] } }))
                                    }
                                ]
                            });
                        }}
                    >
                        + TEXT
                </Button>
                </div>
            </BaseLayoutSidebar>
        </>
    );
});