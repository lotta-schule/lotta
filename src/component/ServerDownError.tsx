import * as React from 'react';

import styles from './errorview.module.scss';

export interface ServerDownErrorProps {
    error: Error;
}

export const ServerDownError = React.memo<ServerDownErrorProps>(({ error }) => {
    return (
        <section className={styles.error}>
            <h1>Server nicht erreichbar</h1>
            <div>
                <img
                    src={'/ServerDownImage.svg'}
                    alt={'Der Server ist nicht erreichbar'}
                />
                <p>
                    Der Server hat einen unbekannten Fehler geworfen. Das Team
                    wurde informiert. Versuch es in einigen Minuten nochmal.
                </p>
                <p>{error.message}</p>
            </div>
        </section>
    );
});
ServerDownError.displayName = 'ServerDownError';
