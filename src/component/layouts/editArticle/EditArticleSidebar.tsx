import React, { memo, FunctionComponent } from 'react';
import { Card, CardContent, Divider, TextField, Button, makeStyles, Typography } from '@material-ui/core';
import { ArticleModel } from '../../../model';
import clsx from 'clsx';
import { Save as SaveIcon, Edit } from '@material-ui/icons';
import { CategorySelect } from './CategorySelect';

const useStyles = makeStyles(theme => ({
    button: {
        margin: theme.spacing(1),
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
}));

interface EditArticleSidebarProps {
    article: ArticleModel;
    onUpdate(article: ArticleModel): void;
    onSave(): void;
}

export const EditArticleSidebar: FunctionComponent<EditArticleSidebarProps> = memo(({ article, onUpdate, onSave }) => {
    const styles = useStyles();
    return (
        <Card style={{ marginTop: '0.5em', borderRadius: '0' }}>
            <CardContent>
                <Typography variant="h6" align="center">
                    Beitrags-Einstellungen
                </Typography>
            </CardContent>
            <CardContent>
                <TextField
                    label="Titel des Beitrags"
                    placeholder="Placeholder"
                    value={article.title}
                    onChange={e => onUpdate({ ...article, title: e.target.value })}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <TextField
                    label="Vorschautext"
                    placeholder="Füge hier einen kurzen Vorschautext ein"
                    value={article.preview}
                    onChange={e => onUpdate({ ...article, preview: e.target.value })}
                    fullWidth
                    variant="outlined"
                    multiline
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <TextField
                    label="Datum"
                    type={'date'}
                    value={article.updatedAt}
                    disabled
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <CategorySelect
                    selectedCategoryId={article.category && article.category.id}
                    onSelectCategory={category => { }}
                />
            </CardContent>
            <CardContent>
                <TextField
                    label="Seite"
                    value={article.pageName}
                    onChange={e => onUpdate({ ...article, pageName: e.target.value || undefined })}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <img src={'https://placeimg.com/300/150/any'} style={{ width: '100%', height: 'auto' }} alt={`Vorschaubild zu ${article.title}`} />
                <Button
                    variant='outlined'
                    color='secondary'
                    fullWidth
                >
                    <Edit className={clsx(styles.leftIcon, styles.iconSmall)} />
                    Vorschaubild ändern
            </Button>
            </CardContent>
            <CardContent>
                <TextField
                    label="Autoren"
                    fullWidth
                    variant="outlined"
                    multiline
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <TextField
                    label="Sichtbarkeit"
                    fullWidth
                    select
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <Button
                    onClick={onSave}
                    variant='outlined'
                    color='secondary'
                >
                    <SaveIcon className={clsx(styles.leftIcon, styles.iconSmall)} />
                    speichern
            </Button>
            </CardContent>
        </Card>
    )
}
);