import * as React from 'react';

import styles from './error.module.scss';

export const TenantNotFoundError = React.memo(() => {
    return (
        <section className={styles.error}>
            <h1>Seite nicht gefunden.</h1>
            <div>
                <img
                    src={'/TenantNotFoundImage.svg'}
                    alt={'Diese Seite existiert nicht'}
                />
                <p>
                    Unter dieser Adresse ist aktuell keine lotta-Plattform zu
                    erreichen. Überprüfe die Adresse in der Adressleiste.
                </p>
                <p className={styles.secondary}>
                    Sie haben Interesse, ein eigenes lotta unter dieser Adresse
                    anzubieten? Weitere Informationen gibt es auf{' '}
                    <a
                        href="https://lotta.schule"
                        title="Zur Lotta-Projektseite"
                    >
                        lotta.schule
                    </a>
                    .
                </p>
            </div>
        </section>
    );
});
TenantNotFoundError.displayName = 'TenantNotFoundError';
