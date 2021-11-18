import * as React from 'react';
import { Grid, Slider } from '@material-ui/core';
import { SdStorage } from '@material-ui/icons';
import { Button } from 'component/general/button/Button';
import { Checkbox } from 'component/general/form/checkbox';
import { Input } from 'component/general/form/input/Input';
import { Label } from 'component/general/label/Label';
import { useTenant } from 'util/tenant/useTenant';
import { useMutation } from '@apollo/client';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { animated, useSpring } from 'react-spring';

import UpdateTenantMutation from 'api/mutation/UpdateTenantMutation.graphql';

const MEGABYTE = 1024 * 1024;

export const ConstraintList = () => {
    const tenant = useTenant();
    const lastSetLimitRef = React.useRef(20);
    const [value, setValue] = React.useState(
        tenant.configuration.userMaxStorageConfig
            ? parseInt(tenant.configuration.userMaxStorageConfig, 10) / MEGABYTE
            : -1
    );

    const isLimitSet = value >= 0;

    const springProps = useSpring({
        maxHeight: isLimitSet ? '10em' : '0em',
        overflow: 'hidden',
    });

    React.useEffect(() => {
        if (isLimitSet) {
            lastSetLimitRef.current = value;
        }
    }, [isLimitSet, value]);

    const [updateTenant, { loading: isLoading, error }] = useMutation(
        UpdateTenantMutation,
        {
            variables: {
                tenant: {
                    configuration: {
                        ...tenant.configuration,
                        userMaxStorageConfig: String(value * MEGABYTE),
                    },
                },
            },
        }
    );

    return (
        <div>
            <h3>Speicherplatz-Beschränkungen</h3>
            <div>
                <p id={`user-storage-limit`}>
                    Freier Speicher für jeden Nutzer
                </p>
                <ErrorMessage error={error} />
                <p>
                    <small>
                        Der freie Speicher für jeden Nutzer bestimmt, wie viel
                        persönlicher Speicherplatz jeder Nutzer durch seine
                        Anmeldung zur Verfügung gestellt bekommt.
                    </small>
                </p>
                <p>
                    <small>
                        Er bestimmt neben dem Speicher, den der Nutzer durch
                        seine Gruppen zur Verfügung gestellt bekommt, wie viele
                        Medien Nutzer online vorhalten können.
                    </small>
                </p>

                <Checkbox
                    checked={!isLimitSet}
                    label={
                        'Datenmenge, die Nutzer hochladen können, nicht begrenzen'
                    }
                    onChange={(e) =>
                        setValue(
                            e.currentTarget.checked
                                ? -1
                                : lastSetLimitRef.current
                        )
                    }
                />

                <Checkbox
                    checked={isLimitSet}
                    label={
                        'Datenmenge, die Nutzer hochladen können, begrenzen auf:'
                    }
                    onChange={(e) =>
                        setValue(
                            e.currentTarget.checked
                                ? lastSetLimitRef.current
                                : -1
                        )
                    }
                />

                <animated.div style={springProps}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item>
                            <SdStorage />
                        </Grid>
                        <Grid item xs>
                            <Slider
                                value={value}
                                onChange={(_e, value) =>
                                    setValue(value as number)
                                }
                                aria-labelledby={'user-storage-limit'}
                                step={50}
                                min={0}
                                max={8192}
                                marks={true}
                            />
                        </Grid>
                        <Grid item>
                            <Label label={'Begrenzung in MB'}>
                                <Input
                                    value={
                                        isLimitSet
                                            ? value
                                            : lastSetLimitRef.current
                                    }
                                    onChange={({ currentTarget }) => {
                                        if (currentTarget.value) {
                                            setValue(
                                                parseInt(currentTarget.value)
                                            );
                                        }
                                    }}
                                    step={50}
                                    min={0}
                                    type={'number'}
                                    aria-labelledby={'user-storage-limit'}
                                />
                            </Label>
                        </Grid>
                    </Grid>
                </animated.div>
                <Button onClick={() => updateTenant()} disabled={isLoading}>
                    Speichern
                </Button>
            </div>
        </div>
    );
};
