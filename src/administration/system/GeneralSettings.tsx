import * as React from 'react';
import { Button, Box, ErrorMessage, Input, Table } from '@lotta-schule/hubert';
import { useMutation } from '@apollo/client';
import { File } from 'util/model';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useTenant } from 'util/tenant/useTenant';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { useServerData } from 'shared/ServerDataContext';
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

            <section className={styles.section}>
                <Input
                    value={title}
                    onChange={(e) => setTitle(e.currentTarget.value)}
                />
            </section>

            <h3>Logo der Seite</h3>
            <section className={styles.section}>
                <div className={styles.gridContainer}>
                    <Box className={styles.gridItem} style={{ width: '25%' }}>
                        <SelectFileOverlay
                            label={'Logo ändern'}
                            onSelectFile={(logo) => setLogo(logo)}
                            allowDeletion
                        >
                            {logo ? (
                                <ResponsiveImage
                                    resize={'inside'}
                                    height={80}
                                    src={File.getFileRemoteLocation(
                                        baseUrl,
                                        logo
                                    )}
                                    alt={`Logo ${title}`}
                                />
                            ) : (
                                <PlaceholderImage width={160} height={80} />
                            )}
                        </SelectFileOverlay>
                    </Box>
                    <p className={styles.gridItem}>
                        Für eine optimale Darstellung sollte das Logo eine Höhe
                        von mindestens 160 Pixeln haben.
                    </p>
                </div>
            </section>

            <h3>Domains</h3>
            <section className={styles.section}>
                <Table>
                    <tbody>
                        <tr>
                            <td>
                                <Link href={`https://${tenant.host}`}>
                                    {tenant.host}
                                </Link>
                            </td>
                        </tr>
                    </tbody>
                </Table>
            </section>

            <section>
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
            </section>
        </div>
    );
};
