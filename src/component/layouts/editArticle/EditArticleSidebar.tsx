import React, { memo, useState } from 'react';
import { ArticleModel } from '../../../model';
import { Card, CardContent, TextField, Button, makeStyles, Typography, FormControl, FormLabel, FormControlLabel, Switch } from '@material-ui/core';
import { CategorySelect } from './CategorySelect';
import { DateTimePicker } from '@material-ui/pickers';
import { GroupSelect } from './GroupSelect';
import { parseISO } from 'date-fns';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { Save as SaveIcon } from '@material-ui/icons';
import { SearchUserField } from '../adminLayout/userManagement/SearchUserField';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { theme } from 'theme';
import { uniqBy } from 'lodash';
import { useCurrentUser } from 'util/user/useCurrentUser';
import { User } from 'util/model';
import classNames from 'classnames';
import Img from 'react-cloudimage-responsive';
import useRouter from 'use-react-router';

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
    onSave(additionalProps?: Partial<ArticleModel>): void;
}

export const EditArticleSidebar = memo<EditArticleSidebarProps>(({ article, onUpdate, onSave }) => {
    const styles = useStyles();
    const [currentUser] = useCurrentUser();
    const { history } = useRouter();

    const [isReadyToPublish, setIsReadyToPublish] = useState(false);
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
                    value={article.preview || ''}
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
            {User.isAdmin(currentUser) && (
                <CardContent>
                    <CategorySelect
                        selectedCategoryId={article.category && article.category.id}
                        onSelectCategory={category => onUpdate({ ...article, category })}
                    />
                </CardContent>
            )}
            <CardContent>
                <TextField
                    label="Thema"
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
                    ) : <PlaceholderImage width={'100%'} height={150} />}
                </SelectFileOverlay>
            </CardContent>
            <CardContent>
                <SearchUserField
                    className={styles.searchUserField}
                    onSelectUser={user => onUpdate({ ...article, users: uniqBy(article.users.concat([user]), 'id') })}
                />
                <ul>
                    {article.users.map(user => (
                        <li key={user.id}>{User.getNickname(user)}</li>
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
            {!article.readyToPublish && (
                <CardContent>
                    <FormControl component={'fieldset'}>
                        <FormLabel component={'legend'}>
                            Gib den Artikel zur Kontrolle frei, um ihn als 'fertig' zu markieren.
                            Ein Verantwortlicher kann ihn dann sichtbar schalten.
                    </FormLabel>
                        <FormControlLabel
                            value={1}
                            control={<Switch color={'secondary'} />}
                            onChange={(_, checked) => setIsReadyToPublish(checked)}
                            label={isReadyToPublish ? 'Beitrag wird zur Kontrolle freigegeben' : 'Zur Kontrolle freigeben'}
                            labelPlacement={'end'}
                        />
                    </FormControl>
                </CardContent>
            )}
            <CardContent>
                <Button
                    onClick={() => onSave({ readyToPublish: isReadyToPublish })}
                    variant={'outlined'}
                    color={'secondary'}
                    size={'small'}
                    style={{ marginRight: theme.spacing(1) }}
                >
                    <SaveIcon className={classNames(styles.leftIcon, styles.iconSmall)} />
                    speichern
                </Button>
                <Button
                    color={'secondary'}
                    variant={'outlined'}
                    size={'small'}
                    onClick={() => history.goBack()}
                >
                    Abbrechen
                </Button>
            </CardContent>
        </Card>
    )
});