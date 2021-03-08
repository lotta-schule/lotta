import React, { memo } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { ArticleLayout } from 'component/layouts/ArticleLayout';
import { ErrorMessage } from 'component/general/ErrorMessage';

export const ArticleRoute = memo<RouteComponentProps<{ id: string }>>(
    ({ match }) => {
        const id = match.params.id.replace(/^(\d+).*/, '$1'); // take only first digits

        if (!id) {
            return <ErrorMessage error={new Error('Seite ungültig')} />;
        }

        return <ArticleLayout title={''} articleId={id} />;
    }
);
export default ArticleRoute;
