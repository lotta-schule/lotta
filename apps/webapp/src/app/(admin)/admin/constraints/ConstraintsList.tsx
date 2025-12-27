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
import { Tenant } from 'util/tenant';
import { useMutation } from '@apollo/client/react';
import { motion } from 'framer-motion';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

import styles from './ConstraintsList.module.scss';

const MEGABYTE = 1024 * 1024;

export type ConstraintListProps = {
  tenant: Tenant;
};

export const ConstraintList = ({ tenant }: ConstraintListProps) => {
  const DEFAULT = 1024;
  const lastSetLimitRef = React.useRef<number | null>(DEFAULT);
  const [value, setValue] = React.useState(
    tenant.configuration.userMaxStorageConfig
      ? parseInt(tenant.configuration.userMaxStorageConfig, 10) / MEGABYTE
      : null
  );

  const isLimitSet = !!value && value >= 0;

  const valueOrDefault = isLimitSet
    ? value
    : lastSetLimitRef.current || DEFAULT;

  React.useEffect(() => {
    if (isLimitSet) {
      lastSetLimitRef.current = value;
    }
  }, [isLimitSet, value]);

  const [updateTenant, { error }] = useMutation(UpdateTenantMutation, {
    variables: {
      tenant: {
        configuration: {
          ...tenant.configuration,
          userMaxStorageConfig:
            value !== null ? String(value * MEGABYTE) : null,
        },
      },
    },
  });

  return (
    <div className={styles.root}>
      <h3>Speicherplatz-Beschränkungen</h3>
      <div>
        <p id={`user-storage-limit`}>Freier Speicher für jeden Nutzer</p>
        <ErrorMessage error={error} />
        <p>
          <small>
            Der freie Speicher für jeden Nutzer bestimmt, wie viel persönlicher
            Speicherplatz jeder Nutzer durch seine Anmeldung zur Verfügung
            gestellt bekommt.
          </small>
        </p>
        <p>
          <small>
            Er bestimmt neben dem Speicher, den der Nutzer durch seine Gruppen
            zur Verfügung gestellt bekommt, wie viele Medien Nutzer online
            vorhalten können.
          </small>
        </p>

        <Checkbox
          isSelected={!isLimitSet}
          onChange={(isSelected) =>
            setValue(isSelected ? null : lastSetLimitRef.current)
          }
        >
          Datenmenge, die Nutzer hochladen können, nicht begrenzen
        </Checkbox>

        <Checkbox
          isSelected={isLimitSet}
          onChange={(isSelected) =>
            setValue(isSelected ? lastSetLimitRef.current : null)
          }
        >
          Datenmenge, die Nutzer hochladen können, begrenzen auf:
        </Checkbox>

        <motion.div
          initial={'closed'}
          animate={isLimitSet ? 'open' : 'closed'}
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
                value={value ?? 0}
                onChange={(e) => setValue(parseInt(e.target.value))}
                aria-labelledby={'userAvatar-storage-limit'}
                step={50}
                min={0}
                max={8192}
              />
            </div>
            <div>
              <Label label={'Begrenzung in MB'}>
                <Input
                  value={valueOrDefault}
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
        <LoadingButton
          onAction={async () => {
            await updateTenant();
          }}
        >
          Speichern
        </LoadingButton>
      </div>
    </div>
  );
};
