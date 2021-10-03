import * as React from 'react';
import { ContentModuleModel } from 'model';
import { VideoVideo } from './VideoVideo';

import styles from './Video.module.scss';

interface ShowProps {
    contentModule: ContentModuleModel<{ captions: string[] }>;
}

export const Show = React.memo<ShowProps>(({ contentModule }) => {
    const captions: string[] = contentModule.content?.captions ?? [];
    return (
        <figure className={styles.show}>
            <VideoVideo contentModule={contentModule} />
            <figcaption>{captions[0]}</figcaption>
        </figure>
    );
});
Show.displayName = 'VideoShow';
