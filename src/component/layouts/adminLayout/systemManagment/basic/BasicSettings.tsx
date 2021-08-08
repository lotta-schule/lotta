import * as React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Link,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Typography,
    makeStyles,
} from '@material-ui/core';
import { File } from 'util/model';
import { SelectFileOverlay } from 'component/edit/SelectFileOverlay';
import { PlaceholderImage } from 'component/placeholder/PlaceholderImage';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { useTenant } from 'util/tenant/useTenant';
import { useMutation } from '@apollo/client';
import { UpdateTenantMutation } from 'api/mutation/UpdateTenantMutation';
import { Button } from 'component/general/button/Button';
import Img from 'react-cloudimage-responsive';
import { Input } from 'component/general/form/input/Input';

const useStyles = makeStyles((theme) => ({
    gridContainer: {
        marginBottom: theme.spacing(3),
    },
}));

export const BasicSettings = React.memo(() => {
    const styles = useStyles();
    const tenant = useTenant();
    const [title, setTitle] = React.useState(tenant.title);
    const [logo, setLogo] = React.useState(tenant.configuration.logoImageFile);

    const [updateTenant, { loading: isLoading, error }] = useMutation(
        UpdateTenantMutation
    );

    return (
        <>
            <ErrorMessage error={error} />
            <Typography variant={'h6'}>Name der Seite</Typography>
            <Grid container className={styles.gridContainer}>
                <Grid item sm={6}>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                    />
                </Grid>
            </Grid>

            <Typography variant={'h6'}>Logo der Seite</Typography>
            <Grid container className={styles.gridContainer}>
                <Grid item sm={6}>
                    <Card>
                        <CardContent>
                            <SelectFileOverlay
                                label={'Logo ändern'}
                                onSelectFile={(logo) => setLogo(logo)}
                                allowDeletion
                            >
                                {logo ? (
                                    <Img
                                        operation={'height'}
                                        size={'80'}
                                        src={File.getFileRemoteLocation(logo)}
                                    />
                                ) : (
                                    <PlaceholderImage
                                        width={'100%'}
                                        height={80}
                                    />
                                )}
                            </SelectFileOverlay>
                        </CardContent>
                    </Card>
                </Grid>
                <Grid item sm={6}>
                    <Typography>
                        Für eine optimale Darstellung sollte das Logo eine Höhe
                        von mindestens 160 Pixeln haben.
                    </Typography>
                </Grid>
            </Grid>

            <Typography variant={'h6'}>Domains</Typography>
            <Grid container className={styles.gridContainer}>
                <Grid item sm={12}>
                    <Table size={'small'}>
                        <TableBody>
                            <TableRow>
                                <TableCell>
                                    <Link href={`https://${tenant.host}`}>
                                        {tenant.host}
                                    </Link>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>

            <Grid container justify={'flex-end'}>
                <Grid item sm={6} md={4} lg={3}>
                    <Button
                        fullWidth
                        disabled={isLoading}
                        onClick={() =>
                            updateTenant({
                                variables: {
                                    tenant: {
                                        title,
                                        configuration: {
                                            ...tenant.configuration,
                                            logoImageFile: logo && {
                                                id: logo.id,
                                            },
                                        },
                                    },
                                },
                            })
                        }
                    >
                        speichern
                    </Button>
                </Grid>
            </Grid>
        </>
    );
});
