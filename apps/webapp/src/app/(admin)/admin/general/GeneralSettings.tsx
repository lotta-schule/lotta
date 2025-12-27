'use client';

import * as React from 'react';
import { useMutation } from '@apollo/client/react';
import {
  Box,
  ErrorMessage,
  Input,
  Label,
  List,
  ListItem,
  LoadingButton,
} from '@lotta-schule/hubert';
import { Tenant } from 'util/tenant';
import { SelectFileOverlay } from 'shared/edit/SelectFileOverlay';
import { ResponsiveImage } from 'util/image/ResponsiveImage';
import { PlaceholderImage } from 'shared/placeholder/PlaceholderImage';
import { AdminPageSection } from '../_component/AdminPageSection';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import styles from './GeneralSettings.module.scss';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

export type GeneralSettingsProps = {
  tenant: Tenant;
};

export const GeneralSettings = ({ tenant }: GeneralSettingsProps) => {
  const router = useRouter();
  const [title, setTitle] = React.useState(tenant.title);
  const [logo, setLogo] = React.useState(tenant.logoImageFile);

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
            <Box className={styles.gridItem} style={{ flex: '1 1' }}>
              <SelectFileOverlay
                label={'Logo ändern'}
                onSelectFile={(logo) => {
                  if (logo) {
                    setLogo(logo);
                  }
                }}
                allowDeletion
              >
                {logo ? (
                  <ResponsiveImage
                    file={logo}
                    width={320}
                    format={'logo'}
                    alt={`Logo ${title}`}
                  />
                ) : (
                  <PlaceholderImage width={320} height={160} />
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
        <List>
          <ListItem>
            <Link href={`https://${tenant.host}`}>{tenant.host}</Link>
          </ListItem>
          {tenant.identifier !== tenant.host && (
            <ListItem>
              <Link href={`https://${tenant.identifier}`}>
                {tenant.identifier}
              </Link>
            </ListItem>
          )}
        </List>
      </AdminPageSection>

      <AdminPageSection bottomToolbar>
        <div />
        <LoadingButton
          onAction={async () => {
            await updateTenant({
              variables: {
                tenant: {
                  title,
                  logoImageFileId: logo?.id,
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
