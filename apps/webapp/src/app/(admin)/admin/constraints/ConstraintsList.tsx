'use client';
import * as React from 'react';
import { Icon } from 'shared/Icon';
import { faSdCard } from '@fortawesome/free-solid-svg-icons';
import {
  Checkbox,
  ErrorMessage,
  Input,
  Label,
  LoadingButton,
} from '@lotta-schule/hubert';
import { t } from 'i18next';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';
import { Tenant } from 'util/tenant';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

import styles from './ConstraintsList.module.scss';
import { AdminPageSection } from '../_component/AdminPageSection';

const MEGABYTE = 1024 * 1024;

export type ConstraintListProps = {
  tenant: Tenant;
};

export const ConstraintList = ({ tenant }: ConstraintListProps) => {
  const STORAGE_LIMIT_DEFAULT = 1024;

  const lastSetLimitRef = React.useRef<number | null>(STORAGE_LIMIT_DEFAULT);
  const [storageLimitValue, setValue] = React.useState(
    tenant.configuration.userMaxStorageConfig
      ? parseInt(tenant.configuration.userMaxStorageConfig, 10) / MEGABYTE
      : null
  );
  const [isEmailRegistrationEnabled, setIsEmailRegistrationEnabled] =
    React.useState(tenant.configuration.isEmailRegistrationEnabled !== false);

  const isStorageLimitSet = !!storageLimitValue && storageLimitValue >= 0;

  const storageLimitValueOrDefault = isStorageLimitSet
    ? storageLimitValue
    : lastSetLimitRef.current || STORAGE_LIMIT_DEFAULT;

  React.useEffect(() => {
    if (isStorageLimitSet) {
      lastSetLimitRef.current = storageLimitValue;
    }
  }, [isStorageLimitSet, storageLimitValue]);

  const [updateTenant, { error }] = useMutation(UpdateTenantMutation, {
    variables: {
      tenant: {
        configuration: {
          ...tenant.configuration,
          userMaxStorageConfig:
            storageLimitValue !== null
              ? String(storageLimitValue * MEGABYTE)
              : null,
          isEmailRegistrationEnabled,
        },
      },
    },
  });

  return (
    <div className={styles.root}>
      <ErrorMessage error={error} />
      <AdminPageSection title={t('storage constraints')}>
        <p>
          Der freie Speicher für jeden Nutzer bestimmt, wie viel persönlicher
          Speicherplatz jeder Nutzer durch seine Anmeldung zur Verfügung
          gestellt bekommt.
        </p>

        <Checkbox
          isSelected={!isStorageLimitSet}
          onChange={(isSelected) =>
            setValue(isSelected ? null : lastSetLimitRef.current)
          }
        >
          {t('Do not limit the amount of data users can upload')}
        </Checkbox>

        <Checkbox
          isSelected={isStorageLimitSet}
          onChange={(isSelected) =>
            setValue(isSelected ? lastSetLimitRef.current : null)
          }
        >
          {t('Limit the amount of data users can upload to:')}
        </Checkbox>

        <motion.div
          initial={'closed'}
          animate={isStorageLimitSet ? 'open' : 'closed'}
          variants={{
            open: { opacity: 1, height: 'auto' },
            closed: { opacity: 0, height: 0 },
          }}
        >
          <div className={styles.storageSetting}>
            <div>
              <Icon icon={faSdCard} />
            </div>
            <div className={styles.slider}>
              <input
                type={'range'}
                value={storageLimitValue ?? 0}
                onChange={(e) => setValue(parseInt(e.target.value))}
                aria-labelledby={'userAvatar-storage-limit'}
                step={50}
                min={0}
                max={8192}
              />
            </div>
            <div>
              <Label label={t('storage limit in MB')}>
                <Input
                  value={storageLimitValueOrDefault}
                  onChange={({ currentTarget }) => {
                    if (currentTarget.value) {
                      setValue(parseInt(currentTarget.value));
                    }
                  }}
                  step={50}
                  min={0}
                  type={'number'}
                  aria-labelledby={'userAvatar-storage-limit'}
                />
              </Label>
            </div>
          </div>
        </motion.div>
      </AdminPageSection>

      {!!tenant.eduplacesId && (
        <AdminPageSection title={t('login constraints')}>
          <Checkbox
            isSelected={isEmailRegistrationEnabled}
            onChange={setIsEmailRegistrationEnabled}
          >
            {t('Allow users to register with email address.')}
          </Checkbox>
          <p>
            {t(
              'If disabled, users will only be able to login via Eduplaces. Registration via email will be disabled.'
            )}
          </p>
        </AdminPageSection>
      )}

      <AdminPageSection bottomToolbar>
        <LoadingButton
          style={{ marginLeft: 'auto' }}
          onAction={async () => {
            await updateTenant();
          }}
        >
          {t('save')}
        </LoadingButton>
      </AdminPageSection>
    </div>
  );
};
