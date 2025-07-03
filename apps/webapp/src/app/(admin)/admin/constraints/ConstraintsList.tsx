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
import { TenantModel } from 'model';
import { useMutation } from '@apollo/client';
import { motion } from 'framer-motion';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

import styles from './ConstraintsList.module.scss';

const MEGABYTE = 1024 * 1024;

export type ConstraintListProps = {
  tenant: TenantModel;
};

export const ConstraintList = ({ tenant }: ConstraintListProps) => {
  const lastSetLimitRef = React.useRef(20);
  const [value, setValue] = React.useState(
    tenant.configuration.userMaxStorageConfig
      ? parseInt(tenant.configuration.userMaxStorageConfig, 10) / MEGABYTE
      : -1
  );

  const isLimitSet = value >= 0;

  // eslint-disable-next-line react-compiler/react-compiler
  const valueOrDefault = isLimitSet ? value : lastSetLimitRef.current;

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
          userMaxStorageConfig: String(value * MEGABYTE),
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
            setValue(isSelected ? -1 : lastSetLimitRef.current)
          }
        >
          Datenmenge, die Nutzer hochladen können, nicht begrenzen
        </Checkbox>

        <Checkbox
          isSelected={isLimitSet}
          onChange={(isSelected) =>
            setValue(isSelected ? lastSetLimitRef.current : -1)
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
                value={value}
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
