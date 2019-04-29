import React, { FunctionComponent, memo } from 'react';
import { PageLayout } from './PageLayout';
import { Card, CardContent, Typography, CardMedia, Input, Divider, TextField, Button } from '@material-ui/core';
import { ArticleModel } from '../../model';

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
        <PageLayout sidebar={(
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
            <Card>
                <div style={{ display: 'flex' }}>
                    <CardMedia
                        style={{ width: 150 }}
                        image={'https://via.placeholder.com/150x150'}
                        title={`Vorschaubild zu ${article.title}`}
                    />
                    <CardContent>
                        <Typography variant="h4" component="h3">
                            {article.title}
                        </Typography>
                        <Typography variant={'subtitle1'} color="textSecondary">
                            15.07.2019 &bull; Oskarverleihung &bull; 18 Views &bull; Autor: Lola &bull; Bewertung
                        </Typography>
                        <Typography variant={'subheading'} color="textSecondary">
                            (Füge hier einen kurzen Vorschautext von etwa 30 Wörtern ein)
                        </Typography>
                    </CardContent>
                </div>
            </Card>
            {article.modules.map(contentModule => (
                <Card key={contentModule.id} component={'section'}>
                    <CardContent>
                        <Typography variant={'body1'}>
                            {contentModule.text}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </PageLayout>
    );
});