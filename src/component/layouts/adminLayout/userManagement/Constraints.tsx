import * as React from 'react';
import {
    Checkbox,
    FormControlLabel,
    Grid,
    InputAdornment,
    Slider,
    TextField,
    Typography,
} from '@material-ui/core';
import { Button } from 'component/general/button/Button';
import { SdStorage } from '@material-ui/icons';
import { useTenant } from 'util/tenant/useTenant';
import { useMutation } from '@apollo/client';
import { UpdateTenantMutation } from 'api/mutation/UpdateTenantMutation';
import { ErrorMessage } from 'component/general/ErrorMessage';
import { animated, useSpring } from 'react-spring';

export const Constraints = React.memo(() => {
    const tenant = useTenant();
    const defaultLimitRef = React.useRef(20);
    const [value, setValue] = React.useState(
        tenant.configuration.userMaxStorageConfig ?? defaultLimitRef.current
    );

    const isLimitSet = value >= 0;

    const springProps = useSpring({
        maxHeight: isLimitSet ? '10em' : '0em',
        overflow: 'hidden',
    });

    React.useEffect(() => {
        if (isLimitSet) {
            defaultLimitRef.current = value;
        }
    }, [isLimitSet, value]);

    const [updateTenant, { loading: isLoading, error }] = useMutation(
        UpdateTenantMutation,
        {
            variables: {
                tenant: {
                    configuration: {
                        ...tenant.configuration,
                        userMaxStorageConfig: value,
                    },
                },
            },
        }
    );

    return (
        <>
            <Typography variant={'h5'}>Speicherplatz-Beschränkungen</Typography>
            <div>
                <Typography id={`user-storage-limit`} gutterBottom>
                    Freier Speicher für jeden Nutzer
                </Typography>
                <ErrorMessage error={error} />
                <Typography variant={'body2'} component={'div'}>
                    <p>
                        Der freie Speicher für jeden Nutzer bestimmt, wie viel
                        persönlicher Speicherplatz jeder Nutzer durch seine
                        Anmeldung zur Verfügung gestellt bekommt.
                    </p>
                    <p>
                        Er bestimmt neben dem Speicher, den der Nutzer durch
                        seine Gruppen zur Verfügung gestellt bekommt, wie viele
                        Medien Nutzer online vorhalten können.
                    </p>
                </Typography>

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!isLimitSet}
                            onChange={(_e, checked) =>
                                setValue(checked ? -1 : defaultLimitRef.current)
                            }
                        />
                    }
                    label={
                        'Datenmenge, die Nutzer hochladen können, nicht begrenzen'
                    }
                />

                <FormControlLabel
                    control={
                        <Checkbox
                            checked={isLimitSet}
                            onChange={(_e, checked) =>
                                setValue(checked ? defaultLimitRef.current : -1)
                            }
                        />
                    }
                    label={
                        'Datenmenge, die Nutzer hochladen können, begrenzen auf:'
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
                            <TextField
                                label={''}
                                value={
                                    isLimitSet ? value : defaultLimitRef.current
                                }
                                onChange={({ currentTarget }) => {
                                    if (currentTarget.value) {
                                        setValue(parseInt(currentTarget.value));
                                    }
                                }}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position={'start'}>
                                            MB
                                        </InputAdornment>
                                    ),
                                }}
                                inputProps={{
                                    step: 50,
                                    min: 0,
                                    type: 'number',
                                    'aria-labelledby': 'user-storage-limit',
                                }}
                                variant="outlined"
                            />
                        </Grid>
                    </Grid>
                </animated.div>
                <Button onClick={() => updateTenant()} disabled={isLoading}>
                    Speichern
                </Button>
            </div>
        </>
    );
});
