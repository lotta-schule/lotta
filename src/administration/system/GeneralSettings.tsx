import * as React from 'react';
import {
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableRow,
    TableCell,
} from '@material-ui/core';
import { File } from 'util/model';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { ErrorMessage } from 'shared/general/ErrorMessage';
import { useTenant } from 'util/tenant/useTenant';
import { useMutation } from '@apollo/client';
import { Button } from 'shared/general/button/Button';
import { Input } from 'shared/general/form/input/Input';
import { useServerData } from 'shared/ServerDataContext';
import Img from 'react-cloudimage-responsive';
import Link from 'next/link';

import styles from '../shared.module.scss';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

export const GeneralSettings = () => {
    const { baseUrl } = useServerData();
    const tenant = useTenant();
    const [title, setTitle] = React.useState(tenant.title);
    const [logo, setLogo] = React.useState(tenant.configuration.logoImageFile);

    const [updateTenant, { loading: isLoading, error }] =
        useMutation(UpdateTenantMutation);

    return (
        <div>
            <ErrorMessage error={error} />
            <h3>Name der Seite</h3>
            <Grid container className={styles.gridContainer}>
                <Grid item sm={6}>
                    <Input
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                    />
                </Grid>
            </Grid>

            <h3>Logo der Seite</h3>
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
                                        src={File.getFileRemoteLocation(
                                            baseUrl,
                                            logo
                                        )}
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
                    <p>
                        Für eine optimale Darstellung sollte das Logo eine Höhe
                        von mindestens 160 Pixeln haben.
                    </p>
                </Grid>
            </Grid>

            <h3>Domains</h3>
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

            <Grid container justifyContent={'flex-end'}>
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
        </div>
    );
};
