import { ArticleModel } from '../../model';
import { Card, CardContent, Typography, CardMedia, Divider, TextField, Button } from '@material-ui/core';
import BaseLayout from './BaseLayout';
import React, { FunctionComponent, memo } from 'react';
import { Article } from '../article/Article';

// const style: StyleRulesCallback = () => ({
//     card: {
//         display: 'flex',
//         flexDirection: 'row'
//     }
// });

export interface ArticleLayoutProps {
    article: ArticleModel;
}

export const ArticleLayout: FunctionComponent<ArticleLayoutProps> = memo(({ article }) => {
    return (
        <BaseLayout sidebar={(
            <Card>
                <CardContent>
                    <TextField
                        label="Titel des Beitrags"
                        placeholder="Placeholder"
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
                    <Button fullWidth>speichern</Button>
                    <Button fullWidth>speichern</Button>
                    <Button fullWidth>speichern</Button>
                </CardContent>
            </Card>
        )}>
            <Article article={article} />
        </BaseLayout>
    );
});