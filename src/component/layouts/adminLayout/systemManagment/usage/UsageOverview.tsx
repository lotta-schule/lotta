import React, { memo } from 'react';
import {
    Card,
    CardContent,
    Grid,
    Grow,
    Typography,
    makeStyles,
    LinearProgress,
} from '@material-ui/core';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useTenant } from 'util/tenant/useTenant';
import { FileSize } from 'util/FileSize';
import { useQuery } from '@apollo/client';
import { format } from 'date-fns';
import { de } from 'date-fns/locale';
import { GetUsageQuery } from 'api/query/GetUsageQuery';

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        textAlign: 'center',
        marginBottom: theme.spacing(3),
    },
}));

export const UsageOverview = memo(() => {
    const styles = useStyles();
    const tenant = useTenant();

    const { data, error, loading: isLoading } = useQuery(GetUsageQuery);

    const getMediaConversionTimeFormatted = (usage: any) => {
        if (!data?.usage) {
            return null;
        }
        if (usage.media.mediaConversionCurrentPeriod < 60) {
            return `${usage.media.mediaConversionCurrentPeriod} Sekunden`;
        } else {
            return `${Math.round(
                usage.media.mediaConversionCurrentPeriod / 60
            )} Minuten`;
        }
    };

    return (
        <>
            <ErrorMessage error={error} />
            <Card variant={'outlined'}>
                <CardContent>
                    <Typography color="textSecondary" gutterBottom>
                        {tenant.host}
                    </Typography>
                    <Typography variant={'h5'} component={'h2'}>
                        {tenant.title}
                    </Typography>
                    <Typography color={'textSecondary'}>
                        {tenant.insertedAt}
                    </Typography>
                </CardContent>
            </Card>
            {/* Wär doch cool hier mal einen richtigen Grafen zu zeigen */}
            <Grow in={isLoading}>
                <LinearProgress color={'secondary'} />
            </Grow>
            <Grid container className={styles.gridContainer}>
                <Grid item xs={2}>
                    &nbsp;
                </Grid>
                <Grid item xs={5}>
                    <Typography variant={'h3'}> Speicherplatz </Typography>
                </Grid>
                <Grid item xs={5}>
                    <Typography variant={'h3'}> Multimedia </Typography>
                </Grid>
            </Grid>
            {data?.usage?.map((usage: any, index: number) => (
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
        </>
    );
});
