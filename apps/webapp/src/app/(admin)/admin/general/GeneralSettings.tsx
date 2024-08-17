'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client';
import {
  Box,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
  Table,
} from '@lotta-schule/hubert';
import { TenantModel } from 'model';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { File } from 'util/model/File';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { AdminPageSection } from '../_component/AdminPageSection';
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

      <AdminPageSection title="Name und Logo">
        <Label label="Name der Seite">
          <Input
            value={title}
            onChange={(e) => setTitle(e.currentTarget.value)}
          />
        </Label>

        <Label label={'Logo der Seite'}>
          <div className={styles.gridContainer}>
            <Box className={styles.gridItem}>
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
        </Label>
      </AdminPageSection>

      <AdminPageSection title="Domain">
        <Table>
          <tbody>
            <tr>
              <td>
                <Link href={`https://${tenant.host}`}>{tenant.host}</Link>
              </td>
            </tr>
          </tbody>
        </Table>
      </AdminPageSection>

      <AdminPageSection bottomToolbar>
        <div />
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
      </AdminPageSection>
    </div>
  );
};
