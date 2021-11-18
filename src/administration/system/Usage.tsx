import * as React from 'react';
import { Card, CardContent, Grid } from '@material-ui/core';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { useTenant } from 'util/tenant/useTenant';
import { FileSize } from 'util/FileSize';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';

import styles from '../shared.module.scss';

export interface UserProps {
    usage: any;
    error?: Error | null;
}

export const Usage = React.memo<UserProps>(({ usage, error }) => {
    const tenant = useTenant();

    const getMediaConversionTimeFormatted = (usage: any) => {
        if (!usage) {
            return null;
        }
        if (usage.media.mediaConversionCurrentPeriod < 60) {
            return `${usage.media.mediaConversionCurrentPeriod || 0} Sekunden`;
        } else {
            return `${Math.round(
                usage.media.mediaConversionCurrentPeriod / 60
            )} Minuten`;
        }
    };

    return (
        <div>
            <ErrorMessage error={error} />
            <Card variant={'outlined'}>
                <CardContent>
                    <small>{tenant.host}</small>
                    <h5>{tenant.title}</h5>
                    <p>{tenant.insertedAt}</p>
                </CardContent>
            </Card>
            {/* Wär doch cool hier mal einen richtigen Grafen zu zeigen */}
            <Grid
                container
                className={styles.gridContainer}
                justifyContent={'center'}
            >
                <Grid item xs={2}>
                    &nbsp;
                </Grid>
                <Grid item xs={5}>
                    <h3>Speicherplatz</h3>
                </Grid>
                <Grid item xs={5}>
                    <h3>Multimedia</h3>
                </Grid>
            </Grid>
            {usage?.map((usage: any, index: number) => (
                <Grid
                    container
                    className={styles.gridContainer}
                    key={usage.periodStart}
                >
                    <Grid item xs={2}>
                        <Card>
                            <CardContent>
                                {format(
                                    new Date(usage.periodStart),
                                    'MMMM yyyy',
                                    { locale: de }
                                )}
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={5}>
                        <Card>
                            {index === 0 && (
                                <CardContent>
                                    <div>
                                        {new FileSize(
                                            usage.storage.usedTotal
                                        ).humanize()}
                                    </div>
                                    <div>
                                        <small>
                                            ({usage.storage.filesTotal} Dateien)
                                        </small>
                                    </div>
                                </CardContent>
                            )}
                        </Card>
                    </Grid>
                    <Grid item xs={5}>
                        <Card>
                            <CardContent>
                                {getMediaConversionTimeFormatted(usage)}{' '}
                                Audio/Video
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            ))}
        </div>
    );
});
Usage.displayName = 'AdminSystemUsage';
