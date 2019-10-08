import React, { memo } from 'react';
import { ArticleLayout } from 'component/layouts/ArticleLayout';
import { RouteComponentProps } from 'react-router-dom';

export const ArticleRoute = memo<RouteComponentProps<{ id: string }>>(({ match }) => {
    const id = Number(match.params.id);

    if (!id) {
        return (
            <span style={{ color: 'red' }}>Seite ungültig</span>
        );
    }

    return (
        <ArticleLayout
            title={''}
            articleId={id}
        />
    );
});