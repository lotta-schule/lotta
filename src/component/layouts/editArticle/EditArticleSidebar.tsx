import React, { memo, FunctionComponent } from 'react';
import { Card, CardContent, TextField, Button, makeStyles, Typography } from '@material-ui/core';
import { ArticleModel } from '../../../model';
import classNames from 'classnames';
import { Save as SaveIcon } from '@material-ui/icons';
import { CategorySelect } from './CategorySelect';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import Img from 'react-cloudimage-responsive';
import { GroupSelect } from './GroupSelect';
import { DateTimePicker } from '@material-ui/pickers';
import { parseISO } from 'date-fns';
import { SearchUserField } from '../adminLayout/userManagement/SearchUserField';
import { uniqBy } from 'lodash';
import { theme } from 'theme';

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: '0.5em',
        borderRadius: '0'
    },
    button: {
        margin: theme.spacing(1),
    },
    leftIcon: {
        marginRight: theme.spacing(1),
    },
    iconSmall: {
        fontSize: 20,
    },
    searchUserField: {
        border: `1px solid ${theme.palette.divider}`
    }
}));

interface EditArticleSidebarProps {
    article: ArticleModel;
    onUpdate(article: ArticleModel): void;
    onSave(): void;
}

export const EditArticleSidebar: FunctionComponent<EditArticleSidebarProps> = memo(({ article, onUpdate, onSave }) => {
    const styles = useStyles();
    return (
        <Card className={styles.root}>
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
                <DateTimePicker
                    label="Datum"
                    inputVariant="outlined"
                    ampm={false}
                    disableFuture={true}
                    animateYearScrolling={true}
                    value={parseISO(article.insertedAt)}
                    onChange={date => date && onUpdate({ ...article, insertedAt: date.toISOString() })}
                />
            </CardContent>
            <CardContent>
                <CategorySelect
                    selectedCategoryId={article.category && article.category.id}
                    onSelectCategory={category => onUpdate({ ...article, category })}
                />
            </CardContent>
            <CardContent>
                <TextField
                    label="Seite"
                    value={article.topic}
                    onChange={e => onUpdate({ ...article, topic: e.target.value || undefined })}
                    fullWidth
                    variant="outlined"
                    InputLabelProps={{
                        shrink: true,
                    }}
                />
            </CardContent>
            <CardContent>
                <SelectFileOverlay label={'Vorschaubild ändern'} onSelectFile={previewImageFile => onUpdate({ ...article, previewImageFile })}>
                    {article.previewImageFile ? (
                        <Img operation={'width'} size={'300x200'} src={article.previewImageFile.remoteLocation} />
                    ) : (
                            <img src={'https://placeimg.com/300/200/any'} style={{ width: '100%', height: 'auto' }} alt={`Vorschaubild zu ${article.title}`} />
                        )}
                </SelectFileOverlay>
            </CardContent>
            <CardContent>
                <SearchUserField
                    className={styles.searchUserField}
                    onSelectUser={user => onUpdate({ ...article, users: uniqBy(article.users.concat([user]), 'id') })}
                />
                <ul>
                    {article.users.map(user => (
                        <li>{user.nickname}</li>
                    ))}
                </ul>
            </CardContent>
            <CardContent>
                <GroupSelect
                    selectedGroupId={undefined}
                    variant={'outlined'}
                    onSelectGroupId={() => { }}
                />
            </CardContent>
            <CardContent>
                <Button
                    onClick={onSave}
                    variant='outlined'
                    color='secondary'
                    size="small"
                    style={{ marginRight: theme.spacing(1) }}
                >
                    <SaveIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                    speichern
            </Button>
                <Button
                    color="secondary"
                    variant="outlined"
                    size="small"
                >
                    Abbrechen
                </Button>
            </CardContent>
        </Card >
    )
}
);