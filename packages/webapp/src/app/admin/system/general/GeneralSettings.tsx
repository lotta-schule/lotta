'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client';
import {
  Box,
  ErrorMessage,
  Input,
  LoadingButton,
  Table,
} from '@lotta-schule/hubert';
import { TenantModel } from 'model';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { File } from 'util/model/File';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import styles from './GeneralSettings.module.scss';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

export type GeneralSettingsProps = {
  tenant: TenantModel;
  baseUrl: string;
};

export const GeneralSettings = ({ tenant, baseUrl }: GeneralSettingsProps) => {
  const router = useRouter();
  const [title, setTitle] = React.useState(tenant.title);
  const [logo, setLogo] = React.useState(tenant.configuration.logoImageFile);

  const [updateTenant, { error }] = useMutation(UpdateTenantMutation);

  return (
    <div className={styles.root}>
      <ErrorMessage error={error} />
      <h3>Name der Seite</h3>

      <section>
        <Input
          value={title}
          onChange={(e) => setTitle(e.currentTarget.value)}
        />
      </section>

      <h3>Logo der Seite</h3>
      <section>
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
                  src={File.getFileRemoteLocation(baseUrl, logo)}
                  alt={`Logo ${title}`}
                />
              ) : (
                <PlaceholderImage width={160} height={80} />
              )}
            </SelectFileOverlay>
          </Box>
          <p className={styles.gridItem}>
            Für eine optimale Darstellung sollte das Logo eine Höhe von
            mindestens 160 Pixeln haben.
          </p>
        </div>
      </section>

      <h3>Domains</h3>
      <section>
        <Table>
          <tbody>
            <tr>
              <td>
                <Link href={`https://${tenant.host}`}>{tenant.host}</Link>
              </td>
            </tr>
          </tbody>
        </Table>
      </section>

      <section>
        <LoadingButton
          onAction={async () => {
            await updateTenant({
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
            });
          }}
          onComplete={() => {
            router.refresh();
          }}
        >
          speichern
        </LoadingButton>
      </section>
    </div>
  );
};
