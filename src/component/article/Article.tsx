import * as React from 'react';
import { makeStyles } from '@material-ui/core';
import { ArticleModel } from '../../model';
import { ContentModule } from './module/ContentModule';
import { ArticleTitle } from './ArticleTitle';

const useStyles = makeStyles((theme) => ({
    root: {},
    contentModules: {
        backgroundColor: theme.palette.background.paper,
    },
}));

interface ArticleProps {
    article: ArticleModel;
    onUpdateArticle?(article: ArticleModel): void;
}

export const Article = React.memo<ArticleProps>(({ article }) => {
    const styles = useStyles();

    return (
        <article className={styles.root} data-testid={'Article'}>
            <ArticleTitle article={article} />
            <section className={styles.contentModules}>
                {[...article.contentModules]
                    .sort((cm1, cm2) => cm1.sortKey - cm2.sortKey)
                    .map((contentModule, index) => (
                        <ContentModule
                            key={contentModule.id}
                            index={index}
                            contentModule={contentModule}
                        />
                    ))}
            </section>
        </article>
    );
});
Article.displayName = 'Article';
