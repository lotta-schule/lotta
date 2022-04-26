import * as React from 'react';
import { ArticleModel } from 'model';
import { ArticleTitle } from './ArticleTitle';
import { ContentModule } from './module/ContentModule';

import styles from './Article.module.scss';

interface ArticleProps {
    article: ArticleModel;
    onUpdateArticle?(article: ArticleModel): void;
}

export const Article = React.memo<ArticleProps>(({ article }) => {
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
                            article={article}
                            contentModule={contentModule}
                        />
                    ))}
            </section>
        </article>
    );
});
Article.displayName = 'Article';
