import React, { memo } from 'react';
import { ArticleModel } from 'model';
import { ArticlePreviewDensedLayout } from './ArticlePreviewDensedLayout';
import { ArticlePreviewStandardLayout } from './ArticlePreviewStandardLayout';

interface ArticlePreviewProps {
    article: ArticleModel;
    disableLink?: boolean;
    disableEdit?: boolean;
    disablePin?: boolean;
    limitedHeight?: boolean;
    isEmbedded?: boolean;
    layout?: 'standard' | 'densed' | '2-columns';
}

export const ArticlePreview = memo<ArticlePreviewProps>(({ layout, ...props }) => {

    switch (layout) {
        case 'densed':
            return (
                <ArticlePreviewDensedLayout {...props} />
            );
        default:
            return (
                <ArticlePreviewStandardLayout narrow={layout === '2-columns'} {...props} />
            );
    }

});
