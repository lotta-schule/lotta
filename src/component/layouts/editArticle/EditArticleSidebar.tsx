import React, { memo, FunctionComponent } from 'react';
import { Card, CardContent, CardMedia, Divider, TextField, Button } from '@material-ui/core';
import { ArticleModel } from '../../../model';

interface EditArticleSidebarProps {
    article: ArticleModel;
    onUpdate(article: ArticleModel): void;
    onSave(): void;
}

export const EditArticleSidebar: FunctionComponent<EditArticleSidebarProps> = memo(({ article, onUpdate, onSave }) => (
    <Card>
        <CardContent>
            <TextField
                label="Titel des Beitrags"
                placeholder="Placeholder"
                value={article.title}
                onChange={e => onUpdate({ ...article, title: e.target.value })}
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </CardContent>
        <Divider />
        <CardContent>
            <TextField
                label="Vorschautext"
                placeholder="Füge hier einen kurzen Vorschautext ein"
                value={article.preview}
                onChange={e => onUpdate({ ...article, preview: e.target.value })}
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </CardContent>
        <Divider />
        <CardContent>
            <TextField
                label="Datum"
                type={'date'}
                value={article.updatedAt}
                disabled
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </CardContent>
        <Divider />
        <CardContent>
            <TextField
                label="Kategorie"
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </CardContent>
        <CardContent>
            <TextField
                label="Seite"
                value={article.pageName}
                onChange={e => onUpdate({ ...article, pageName: e.target.value || undefined })}
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </CardContent>
        <Divider />
        <CardMedia
            style={{ width: 150 }}
            image={'https://via.placeholder.com/150x150'}
            title={`Vorschaubild zu ${article.title}`}
        />
        <Divider />
        <CardContent>
            <TextField
                label="Autoren"
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </CardContent>
        <Divider />
        <CardContent>
            <TextField
                label="Sichtbarkeit"
                fullWidth
                InputLabelProps={{
                    shrink: true,
                }}
            />
        </CardContent>
        <Divider />
        <CardContent>
            <Button fullWidth onClick={onSave}>speichern</Button>
            <Button fullWidth>speichern</Button>
            <Button fullWidth>speichern</Button>
        </CardContent>
    </Card>
));